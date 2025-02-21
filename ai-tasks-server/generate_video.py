from dotenv import load_dotenv
from fish_audio_sdk import Session, TTSRequest, ReferenceAudio
import os
import re
import json
import time
import pprint
import numpy as np
import torch
import requests
from loguru import logger
import whisper
import sentence_transformers
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from request_manager import RequestLogger
from create_simulation import get_simulation

current_dir = os.path.dirname(os.path.abspath(__file__))

# Load environment variables from .env file
load_dotenv(os.path.join(current_dir, '.env'))

# Create array to store processed segments

# -----------------------------
# Global Voice Assignments
# -----------------------------
global_voice_assignments = {}

sorted_segments = []
# No need for nest_asyncio since we're not in Jupyter and it causes issues with uvloop

# -------------------------
# API Keys and Fish Session
# -------------------------
FISH_API_KEY = os.environ.get("FISH_API_KEY")  # Get from environment variable
session = Session(FISH_API_KEY)

# -------------------------
# HyperLab API Key (for image generation)
# -------------------------
HYPRLAB_API_KEY = os.environ.get("HYPRLAB_API_KEY")
print("HyperLab API Key:", HYPRLAB_API_KEY)

# -------------------------
# Determine device
# -------------------------
device_flag = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Running on {device_flag}.")

# -------------------------
# Load writing cheat sheet from file (if present)
# -------------------------
CHEAT_SHEET_PATH = os.path.join(current_dir, "writing_cheat_sheet.txt")
if not os.path.isfile(CHEAT_SHEET_PATH):
    print(f"Error: Cheat sheet file '{CHEAT_SHEET_PATH}' not found.")
    cheat_sheet = ""
else:
    with open(CHEAT_SHEET_PATH, "r", encoding="utf-8") as f:
        cheat_sheet = f.read()

# -------------------------
# Load Whisper model into memory (for TTS reference processing)
# -------------------------
logger.info("Loading Whisper model into memory...")
whisper_model = whisper.load_model("base")
logger.info("Whisper-base loaded.")
print("Initial model loading complete.")

"""
Revised Audiobook Generation Script (with parallel requests to Fish and HyperLab APIs).
"""

# -----------------------------
# Helper Functions for XML Parsing
# -----------------------------
def clean_emotion_key(emotion_str):
    """
    Clean the emotion string by removing extraneous parts.
    """
    parts = emotion_str.split('_')
    if len(parts) >= 4:
        candidate = "_".join(parts[3:])
    else:
        candidate = emotion_str
    candidate_parts = candidate.split('_')
    if candidate_parts and candidate_parts[-1].isdigit():
        candidate = "_".join(candidate_parts[:-1])
    return candidate.replace("_", " ")

def parse_element(s, pos):
    """
    Recursively parse an XML element from the string starting at position pos.
    Extracts the text inside the opening tag, ignoring attributes after the first token.
    Returns a tuple (parsed_element, new_pos).
    """
    open_tag_match = re.match(r'<\s*([^>]+)>', s[pos:])
    if not open_tag_match:
        raise ValueError(f"No opening tag found at position {pos}")
    tag_full = open_tag_match.group(1).strip()
    tag = tag_full.split()[0]  # first token as the tag name
    end_open = s[pos:].find('>')
    if end_open == -1:
        raise ValueError(f"Malformed tag starting at position {pos}")
    pos += end_open + 1

    content = []
    while pos < len(s):
        if s[pos:pos+2] == '</':
            close_tag_match = re.match(r'</\s*([^>\s]+)', s[pos:])
            if not close_tag_match:
                print(f"ERROR: Expected closing tag for <{tag}> at position {pos}. Breaking out.")
                break
            closing_tag = close_tag_match.group(1).strip()
            if closing_tag != tag:
                print(f"ERROR: Mismatched closing tag: expected </{tag}> but found </{closing_tag}> at pos {pos}.")
            end_close = s[pos:].find('>')
            if end_close == -1:
                pos = len(s)
            else:
                pos += end_close + 1
            break
        elif s[pos] == '<':
            try:
                child, pos = parse_element(s, pos)
                content.append(child)
            except ValueError as e:
                print(f"WARNING: {e} Skipping malformed tag at position {pos}.")
                next_gt = s.find('>', pos)
                if next_gt == -1:
                    break
                pos += next_gt + 1
        else:
            next_lt = s.find('<', pos)
            if next_lt == -1:
                text = s[pos:].strip()
                pos = len(s)
            else:
                text = s[pos:next_lt].strip()
                pos = next_lt
            if text:
                content.append(text)
    if isinstance(content, list) and content and all(isinstance(x, str) for x in content):
        value = " ".join(content)
    elif len(content) == 1:
        value = content[0]
    else:
        value = content
    return {tag: value}, pos

def parse_string(s):
    """
    Parse the entire XML string into a list of elements.
    """
    pos = 0
    result = []
    while pos < len(s):
        while pos < len(s) and s[pos].isspace():
            pos += 1
        if pos >= len(s):
            break
        if s[pos] != '<':
            next_lt = s.find('<', pos)
            if next_lt == -1:
                break
            pos = next_lt
        element, pos = parse_element(s, pos)
        result.append(element)
    return result

def traverse_tree(speaker, node, current_emotion="default"):
    """
    Recursively traverse the parsed XML tree, extracting text/image segments.
    - If the current tag is one of the known speakers, we treat it as a speaker change.
    - If the current tag is "IMAGE...", it's an image segment.
    - Otherwise, treat the tag as an emotion indicator.
    """
    segments = []
    if isinstance(node, str):
        segments.append({
            "type": "text",
            "speaker": speaker,
            "emotion": current_emotion,
            "text": node
        })
    elif isinstance(node, dict):
        for key, value in node.items():
            lower_key = key.strip().lower()
            if lower_key == "assign_voice":
                # Skip the voice assignment block
                continue
            if key.strip().upper().startswith("IMAGE"):
                # It's an image
                caption = ""
                if isinstance(value, str):
                    caption = value.strip()
                elif isinstance(value, list):
                    caption = " ".join([str(item) for item in value if isinstance(item, str)]).strip()
                else:
                    caption = str(value).strip()
                segments.append({
                    "type": "image",
                    "image_tag": key,
                    "caption": caption
                })
            else:
                # Possibly a speaker or an emotion
                candidate = key.strip()
                known_speakers = {"STORYTELLER", "JOHN", "NICOLE", "JENNIFFER", "BARBARA", "HENRY"}
                if candidate.upper() in known_speakers:
                    new_speaker = candidate.upper()
                    segments.extend(traverse_tree(new_speaker, value, current_emotion=current_emotion))
                else:
                    segments.extend(traverse_tree(speaker, value, current_emotion=candidate))
    elif isinstance(node, list):
        for item in node:
            segments.extend(traverse_tree(speaker, item, current_emotion=current_emotion))
    return segments

def extract_segments_combined(parsed_data):
    """
    Extract only the <Audiobook Narration> or <Audiobook> blocks.
    Flatten them into a list of segments with an 'order' index.
    """
    segments = []
    for element in parsed_data:
        for key, content in element.items():
            lower_key = key.strip().lower()
            if lower_key in ["audiobook narration", "audiobook"]:
                segments.extend(traverse_tree("", content, current_emotion="default"))
    for i, seg in enumerate(segments):
        seg["order"] = i
    return segments


def extract_assign_voice_mappings(story_text, model, voice_profile_keys, voice_profile_embeddings, existing_assignments):
    print('Well this works')
    assign_pattern = re.compile(r'<ASSIGN_VOICE>(.*?)</ASSIGN_VOICE>', re.DOTALL | re.IGNORECASE)
    print('And this too')
    matches = assign_pattern.findall(story_text)
    print('Why did this work?')
    for match in matches:
        print("DEBUG: Found ASSIGN_VOICE content:", match)
        parts = match.split(';')
        for part in parts:
            part = part.strip()
            if not part:
                continue
            if '=' in part:
                name, voice_str = part.split('=', 1)
                name = name.strip().upper()
                voice_str = voice_str.strip()
                if name in existing_assignments:
                    print(f"  Speaker '{name}' already assigned to '{existing_assignments[name]}'.")
                    continue
                if voice_str in voice_profile_keys:
                    chosen_voice = voice_str
                    print(f"  Speaker '{name}': exact match found: '{chosen_voice}'")
                else:
                    print(f"  Speaker '{name}': no exact match for '{voice_str}'. Computing similarities.")
                    voice_str_emb = model.encode([voice_str], normalize_embeddings=True)
                    sims = np.dot(voice_profile_embeddings, voice_str_emb[0])
                    best_idx = np.argmax(sims)
                    chosen_voice = voice_profile_keys[best_idx]
                    print(f"    Best match: '{chosen_voice}' with similarity {sims[best_idx]:.4f}")
                existing_assignments[name] = chosen_voice
    story_cleaned = assign_pattern.sub("", story_text)
    return existing_assignments, story_cleaned

# -----------------------------
# Initialize Sentence Transformer
# -----------------------------
device_st = "cuda" if torch.cuda.is_available() else "cpu"
model_st = sentence_transformers.SentenceTransformer('BAAI/bge-small-en-v1.5', device=device_st)

# Load voice mapping
voice_mapping_path = os.path.join(current_dir, "emottsvoices", "folder_mp3_mapping.json")
with open(voice_mapping_path, "r", encoding="utf-8") as file:
    voice_emotion_reference_dict = json.load(file)

voice_profile_keys = list(voice_emotion_reference_dict.keys())
voice_profile_embeddings = model_st.encode(voice_profile_keys, normalize_embeddings=True)
print("DEBUG: Precomputed embeddings for voice profile keys:", len(voice_profile_keys))



# Prepare inner embeddings for each voice profile
inner_embeddings_dict = {}
for vp in voice_emotion_reference_dict:
    emotion_dict = voice_emotion_reference_dict[vp]
    raw_keys = list(emotion_dict.keys())
    cleaned_keys = [clean_emotion_key(k) for k in raw_keys]
    emb = model_st.encode(cleaned_keys, normalize_embeddings=True)
    inner_embeddings_dict[vp] = {
        "raw_keys": raw_keys,
        "cleaned_keys": cleaned_keys,
        "embeddings": emb
    }

# -----------------------------
# HyperLab API for Image Generation (with retry)
# -----------------------------
def generate_image_with_retry(prompt):
    print('image generation started')
    """
    Call the HyperLab API to generate an image for the given prompt.
    Retries with exponential backoff starting at 500ms up to 10 seconds.
    Returns the URL or None if unsuccessful.
    """
    url = "https://api.hyprlab.io/v1/images/generations"
    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {HYPRLAB_API_KEY}"
    }
    data = {
    "model": "flux-1.1-pro",
    "prompt": prompt,
    "steps": 20,
    "height": 1024,
    "width": 1024,
    "response_format": "url",
    "output_format": "webp"
    }
    delays = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    for delay in delays:
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                res_json = response.json()
                print('image generation done')
                if "data" in res_json and len(res_json["data"]) > 0:
                    return res_json["data"][0]["url"]
            else:
                print(f"Error generating image (status {response.status_code}): {response.text}")
        except Exception as e:
            print(f"Exception generating image: {e}")
        time.sleep(delay)
    return None

# -----------------------------
# Helper for Fish API TTS generation with retry
# -----------------------------
def generate_tts_segment(seg, tts_request, out_path):
    """
    Call the Fish API TTS with the given TTSRequest.
    Retries with exponential backoff starting at 500ms up to 10 seconds.
    On success, writes the output to out_path and returns (segment order, out_path).
    """
    delays = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    for delay in delays:
        try:
            with open(out_path, "wb") as f:
                for chunk in session.tts(tts_request):
                    f.write(chunk)
            return (seg["order"], out_path)
        except Exception as e:
            print(f"Error generating TTS for segment {seg['order']} on attempt with delay {delay} s: {e}")
            time.sleep(delay)
    print(f"Segment {seg['order']} failed after all retries. Skipping.")
    return (seg["order"], None)



def generate_video_logic(prompt, hash_dir, request_logger: RequestLogger):
    request_logger.log('status', 'Test')
    # -----------------------------
    # Main Function
    # -----------------------------
    def generate_audiobook(audiobook_xml):
        """
        Parse the audiobook XML, generate TTS, display audio/images.
        Requests to the Fish API (TTS) and HyperLab (image generation) are sent in parallel.
        """
        global global_voice_assignments
        with open("input_audiobook.xml", "w", encoding="utf-8") as f:
            f.write(audiobook_xml)
        print("Input audiobook XML saved to: input_audiobook.xml")

        # Initialize global_voice_assignments if not already defined
        if not global_voice_assignments:
            global_voice_assignments = {}
            
        global_voice_assignments, story_cleaned = extract_assign_voice_mappings(
            audiobook_xml, model_st, voice_profile_keys, voice_profile_embeddings, global_voice_assignments
        )

        # Extract audiobook content
        audiobook_narrations = re.findall(r'(?s)<Audiobook Narration>.*?</Audiobook Narration>', audiobook_xml, re.IGNORECASE)
        if not audiobook_narrations:
            print("No <Audiobook Narration> blocks found; using entire XML.")
            audiobook_narrations = re.findall(r'(?s)<Audiobook Narration>.*?</Audiobook Narration>', story_cleaned, re.IGNORECASE)
        final_audiobook_content = "\n".join(audiobook_narrations)

        # Parse narration
        narration_parsed = parse_string(final_audiobook_content)
        combined_segments = extract_segments_combined(narration_parsed)
        print("\nDEBUG: Combined Segments (with order):")
        pprint.pprint(combined_segments)

        os.makedirs(os.path.join(hash_dir), exist_ok=True)
        tts_dict = {}      # Mapping: segment order -> TTS output file path
        sorted_segs = []

        # We'll use a ThreadPoolExecutor to process up to 10 concurrent requests.
        with ThreadPoolExecutor(max_workers=10) as executor:
            tts_tasks = {}
            image_tasks = {}

            # Group combined_segments into groups of one image followed by its related text segments
            groups = []
            current_group = None
            for seg in sorted(combined_segments, key=lambda x: x["order"]):
                if seg["type"] == "image":
                    if current_group is not None:
                        groups.append(current_group)
                    current_group = {"image": seg, "texts": []}
                elif seg["type"] == "text":
                    if current_group is None:
                        print("Error: The first segment must be an image.")
                        continue
                    current_group["texts"].append(seg)
            if current_group is not None:
                groups.append(current_group)
            
            # Define callbacks for immediate logging when each future completes
            def tts_callback(fut, order, seg):
                try:
                    result_order, result_path = fut.result()
                    if result_path:
                        print('text+++++++++++++++++++++++++++++++')
                        tts_dict[result_order] = result_path
                        # request_logger.log('file', result_path)
                        request_logger.log('file', f'/segments/hash2/segment_{order}.mp3', order=order)
                        sorted_segs.append(seg)
                except Exception as e:
                    print(f"Error in TTS callback for segment {order}: {e}")

            def image_callback(fut, order, seg):
                try:
                    img_url = fut.result()
                    if img_url:
                        print('image---------------------')
                        request_logger.log('file', img_url, order=order)
                        seg['image_url'] = img_url
                        sorted_segs.append(seg)
                except Exception as e:
                    print(f"Error in image callback for segment {order}: {e}")
            
            # Launch requests group by group to ensure order
            for group in groups:
                # Process image segment for the group
                img_seg = group["image"]
                prompt = img_seg.get("caption", "No caption provided.")
                img_future = executor.submit(generate_image_with_retry, prompt)
                img_future.add_done_callback(lambda fut, order=img_seg["order"], seg=img_seg: image_callback(fut, order, seg))
                
                # Process each text segment (TTS) in the group
                for text_seg in group["texts"]:
                    speaker = text_seg["speaker"].strip().upper()
                    emotion_label_raw = text_seg["emotion"].strip()
                    emotion_label_clean = clean_emotion_key(emotion_label_raw)
                    text = text_seg["text"].strip()
                    print("\nDEBUG: Processing text segment:")
                    print(f"  Speaker: {speaker}")
                    print(f"  Original emotion label: '{emotion_label_raw}'")
                    print(f"  Cleaned emotion label: '{emotion_label_clean}'")
                    print(f"  Text: '{text}'")

                    # Determine voice
                    if speaker in global_voice_assignments and speaker != "":
                        voice_profile = global_voice_assignments[speaker]
                        text_seg["voice_profile"] = voice_profile
                        print(f"  Using previously assigned voice profile: '{voice_profile}'")
                    else:
                        default_voice = "Epic_Storyteller_deep_voice"
                        text_seg["voice_profile"] = default_voice
                        print(f"  WARNING: No assigned voice for speaker '{speaker}'. Using default: '{default_voice}'.")

                    # Determine reference audio for emotion
                    if text_seg["voice_profile"] in voice_emotion_reference_dict:
                        emotion_dict = voice_emotion_reference_dict[text_seg["voice_profile"]]
                        if emotion_label_raw in emotion_dict:
                            chosen_emotion_raw = emotion_label_raw
                            audio_file = emotion_dict[chosen_emotion_raw]
                            print(f"  Exact raw match for emotion '{emotion_label_raw}' found.")
                        else:
                            print(f"  No exact match for emotion '{emotion_label_raw}'. Computing similarity.")
                            inner_info = inner_embeddings_dict[text_seg["voice_profile"]]
                            raw_keys = inner_info["raw_keys"]
                            cleaned_keys = inner_info["cleaned_keys"]
                            emb_matrix = inner_info["embeddings"]
                            emotion_emb = model_st.encode([emotion_label_clean], normalize_embeddings=True)
                            sims = np.dot(emb_matrix, emotion_emb[0])
                            best_idx = int(np.argmax(sims))
                            chosen_emotion_raw = raw_keys[best_idx]
                            audio_file = emotion_dict[chosen_emotion_raw]
                            print(f"  Best emotion match: '{chosen_emotion_raw}' with similarity {sims[best_idx]:.4f}")
                        text_seg["emotion_category"] = chosen_emotion_raw
                        text_seg["audio_file"] = audio_file
                    else:
                        text_seg["emotion_category"] = None
                        text_seg["audio_file"] = None
                        print(f"  ERROR: The voice profile '{text_seg['voice_profile']}' is not in the reference dictionary.")

                    # Load reference audio and transcript
                    if text_seg["audio_file"]:
                        try:
                            current_dir = os.path.dirname(os.path.abspath(__file__))
                            audio_path = os.path.join(current_dir, text_seg["audio_file"])
                            with open(audio_path, "rb") as f:
                                reference_audio = f.read()
                                print("\nDEBUG: Processing reference audio and transcript:")
                                print(f"  Audio file size: {len(reference_audio)} bytes")
                                
                                transcript_path = os.path.splitext(audio_path)[0] + "_transcript.txt"
                                if os.path.exists(transcript_path):
                                    print(f"  Found existing transcript at: {transcript_path}")
                                    with open(transcript_path, "r", encoding="utf-8") as tf:
                                        reference_text = tf.read().strip()
                                    print(f"  Loaded transcript text: '{reference_text}'")
                                else:
                                    print("  No transcript found - running Whisper transcription...")
                                    whisper_result = whisper_model.transcribe(audio_path)
                                    reference_text = whisper_result.get("text", "").strip()
                                    print(f"  Transcription result: '{reference_text}'")
                                    with open(transcript_path, "w", encoding="utf-8") as tf:
                                        tf.write(reference_text)
                                    print(f"  Saved new transcript to: {transcript_path}")
                                
                                print(f"\nInput text to process: '{text}'")
                            print(reference_text)
                        except Exception as e:
                            print(f"Error processing reference audio: {e}")
                            continue
                    else:
                        continue

                    # Build TTS request
                    tts_request = TTSRequest(
                        text=text,
                        references=[ReferenceAudio(audio=reference_audio, text=reference_text)],
                        prosody={"speed": 1.2, "volume": 0},
                        format="mp3",
                    )

                    out_path = os.path.join(hash_dir, f"segment_{text_seg['order']}.mp3")
                    
                    tts_future = executor.submit(generate_tts_segment, text_seg, tts_request, out_path)
                    tts_future.add_done_callback(lambda fut, order=text_seg["order"], seg=text_seg: tts_callback(fut, order, seg))

        # Ensure all segments are in correct order before completion
        sorted_segs.sort(key=lambda x: x["order"])
        
        # Log segments in order
        for seg in sorted_segs:
            if seg["type"] == "text":
                request_logger.log('file', f'/segments/hash2/segment_{seg["order"]}.mp3', order=seg["order"])
            elif seg["type"] == "image":
                request_logger.log('file', seg['image_url'], order=seg["order"])
        
        print("\nAll segments displayed in order.")
        # Explicitly close the stream after all segments are processed
        request_logger.log('complete', 'Stream complete')
        return sorted_segs

    request_logger.log('status', 'Create simulation')

    # -----------------------------
    # Updated Simulation with Extended Introduction, No Bob
    # -----------------------------
    file_path = os.path.join(current_dir, "emottsvoices", "folder_mp3_mapping.json")
    with open(file_path, "r", encoding="utf-8") as file:
        voice_emotion_reference_dict = json.load(file)
    voice_profile_keys = list(voice_emotion_reference_dict.keys())
    available_voices = ""
    for voice in voice_profile_keys:
        available_voices += voice + "\n"

    simulation_text = get_simulation(prompt, available_voices)

    # -----------------------------
    # Extract CURRENT SIMULATION block
    # -----------------------------
    current_sim_pattern = re.compile(r'<CURRENT SIMULATION>(.*?)</CURRENT SIMULATION>', re.DOTALL | re.IGNORECASE)
    current_sim_match = current_sim_pattern.search(simulation_text)
    if current_sim_match:
        current_simulation_text = current_sim_match.group(1)
        print("Extracted CURRENT SIMULATION content.")
    else:
        print("Error: Could not find <CURRENT SIMULATION> block.")
        current_simulation_text = simulation_text

    # Extract all <Audiobook Narration> blocks
    audiobook_narrations = re.findall(r'(?s)<Audiobook Narration>.*?</Audiobook Narration>', current_simulation_text, re.IGNORECASE)
    if not audiobook_narrations:
        print("No <Audiobook Narration> blocks found; using entire CURRENT SIMULATION text.")
        audiobook_narrations = [current_simulation_text]

    final_audiobook_xml = "\n".join(audiobook_narrations)

    # Prepend default ASSIGN_VOICE if none found
    if not re.search(r'<ASSIGN_VOICE>', final_audiobook_xml, re.IGNORECASE):
        default_assign = "<ASSIGN_VOICE>\nSTORYTELLER=Epic_Storyteller_deep_voice;\n</ASSIGN_VOICE>\n"
        final_audiobook_xml = default_assign + final_audiobook_xml
        print("Prepended default ASSIGN_VOICE block.")
    else:
        print("ASSIGN_VOICE block already present.")

    # Save the final audiobook input
    with open("final_audiobook_input.xml", "w", encoding="utf-8") as f:
        f.write(final_audiobook_xml)
    print("Final audiobook XML prepared and saved as 'final_audiobook_input.xml'.")

    request_logger.log('status', 'Generate Audiobook')
    # Generate and Display the Initial Audiobook Segments
    generate_audiobook(final_audiobook_xml)


def createMovie(sorted_segments):
    # List of tuples: (image_path, [list of audio_paths])
    media_entries = [
        # Add more entries as needed
    ]

    for i in range(len(sorted_segments)):
        segment = sorted_segments[i]
        if len(media_entries) == 0 and segment['type'] != 'image':
            print('Error: The first segment has to be an image.')
            break
        
        if segment['type'] == 'image':
            media_entries.append((segment['image_url'], []))
        elif segment['type'] == 'text':
            last_entry = media_entries[len(media_entries) - 1]
            last_entry[1].append(segment['audio_file'])
            
    print(media_entries)
    clips = []
    def download_image(url, save_path):
        response = requests.get(url)
        if response.status_code == 200:
            with open(save_path, 'wb') as file:
                file.write(response.content)
            print(f"Image successfully downloaded: {save_path}")
        else:
            print(f"Failed to retrieve image. HTTP Status code: {response.status_code}")

    save_path = './image.webp'
    # media_entries is assumed to be defined somewhere in your code.
    # It should be an iterable of (image_url, [list_of_audio_paths]) pairs.

    for image_path, audio_paths in media_entries:
        # Load each audio clip for the current image
        audio_clips = [AudioFileClip(os.path.join(current_dir, audio_path)) for audio_path in audio_paths]
        
        # Concatenate the audio clips sequentially
        combined_audio = concatenate_audioclips(audio_clips)
        
        # Image path is actually a url
        print('Trying to request: ' + image_path)
        download_image(image_path, save_path)
        
        # Option 1: Simply trim the audio so only the first 1/10 of the audio is used.
        image_clip = ImageClip(save_path).with_duration(combined_audio.duration)
        clip = image_clip.with_audio(combined_audio)
        
        # Option 2: Alternatively, if you want the entire audio to play at 10x speed so it fits the shortened duration,
        # uncomment the next three lines and comment out Option 1 above.
        # image_clip = ImageClip(save_path).with_duration(combined_audio.duration / 10)
        # sped_up_audio = combined_audio.fx(speedx, 10)
        # clip = image_clip.with_audio(sped_up_audio)
        
        print('Successfully requested: ' + image_path)
        clips.append(clip)

    # Concatenate all image clips into one final video
    final_video = concatenate_videoclips(clips)

    # Write the final video to a file with 24 fps
    final_video.write_videofile("output_video.mp4", fps=24)
