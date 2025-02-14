def get_simulation(prompt, available_voices):
    return f'''"Worldsim" is a simulation of characters in a virtual world, where the story of characters and their environment is written in discrete time steps. Each time step has roughly the same duration of about 10 seconds, which can vary based on the events occurring in that moment. In each time step, a "timestep object" is written, containing events. Each event is a situation in which at least one of the so-called "Main Characters" must be present. Main Characters are those who must participate in exactly one event in each time step. There can be two or more Main Characters present in the same event as well. Additionally, there are "Side Characters" who can be present in events with Main Characters, but they are not required to be in an event in every time step. They can remain passive for a period and retrospectively, a plausible story is written to explain their activities since their last interaction with an active character.
    It is very important that you generate for each time step a memory object for each main character. Each main character has to be in one event and each event has to contain at least one memory object of a main character; if two main characters are in the same scene at the same location they will be in the same event, but if they are at different locations then they are in different events. At the end of each timestamp, note explicitly whenever a character changes his or her location.

    Each character, whether active or passive, has a "character description object" detailing their main characteristics like appearance, age, personality traits, and significant long-term goals. This description can be updated and should always be in context when the character appears in a current event. For Main Characters, the character description is automatically in context. Additionally, every character has a memory. This memory is a vector database containing "memory objects." Each memory object describes a character's memory of a specific event. It includes a description of the character's experience, a unique identification number, a timestamp (date and time in the simulated world), sensory impressions across different modalities (sight, sound, taste, touch, smell), feelings, needs, conscious goals, and central thoughts during that event. Each memory object also includes references to other events that are causally or emotionally relevant to the experience. References are realized through textual descriptions and identification numbers of associated memory objects.
    After generating a new memory object for a new time step, the memory objects from the previous time step are added to the memory database. With each new memory object created, it is important to link it with other memory objects that are causally or emotionally relevant. This gradually populates the memory database with more memory objects over time. Prior to writing a new event, search queries are generated from previous experiences, representing central themes, settings, emotions, and thoughts. These queries are transformed into key vectors using sentence embeddings. Memory objects from the memory database, corresponding to characters present in the previous events, are retrieved based on similarity search. These retrieved memory objects that seem similar to the search queries also reference other memory objects that are causally or emotionally relevant. This cascade ensures that memory objects are retrieved for each important character, providing semantic relevance or contextual emotional significance, thereby creating a semantic network.

    In addition to these memory objects retrieved in this manner, the concise character descriptions—summarizing their appearance, personality traits, and long-term goals—are in context for each character. The descriptions of the last "n" events are also in context. Similar to the memory database, there is a global event database where each new event is stored when generating a new current time step. Like the memory objects, each event object has references to other event objects that are causally or dramatically relevant. When generating a new time step with new events, search queries are generated from the immediately preceding events, just as with the memory object context retrieval. Event objects from the event database are retrieved based on semantic similarity to these search queries. This retrieval is done using key vectors. Subsequently, event objects referenced by the retrieved event objects, linked causally or dramatically, are retrieved. This ensures that the current LLM context has event objects relevant to the ongoing events in terms of causality or dramatic significance. Additionally, as mentioned before, the global general character description is also in context.

    Whenever a new memory object is added to the memory database, the general character description is checked to see if it needs to be updated due to a character experiencing something significant that strongly influences their personality traits, long-term goals, or appearance in the current scene. Analogous to the character description, there is also a global general world description, always in context. This general world description provides an overview of the setting in which the simulation takes place and includes dramatic instructions such as a rough general plot or mood that should be present in most events. Furthermore, the general world description lists all Main Characters, Side Characters, and locations. A location database contains a location object for each location in the simulation, describing how the location looks, where it is located, how it can be entered, its appearance, and its significance for the characters in the simulation. It details what characters can do there, and so on. When creating a new event, relevant location objects are also retrieved based on the current plot.

    At the beginning of each timestep there is also a fictive "Author" who elaborates on how to best orchestrate the events in a given timestep, ensuring that they meet these criteria:
    A) Plausible, coherent, and intelligently referring to what has previously been stated in this simulation,
    B) Interesting, with some unexpected yet plausible twists (do not overdo it with unexpected twists; they can be slight if it makes sense, just enough to keep the situation interesting),
    C) Emotionally intelligent, considering what the characters think about other characters (Theory of Mind). The characters in the simulation should all have vivid and plausible thoughts and beliefs about what the others feel, think, and want, based on the observations and knowledge the believing characters have plausibly formed so far.

    At the end of each timestep, write an audiobook excerpt that narrates the events, actions, dialogues, important emotions, and thoughts of the characters in that timestep. Feel free to switch back and forth between events and locations if it contributes to the entertainment value and dramatic quality of the scenes.
    The Audiobook narration MUST ADHERE TO THE FOLLOWING FORMATTING RULES:

    1. Structure:
        The audiobook is structured in segments, alternating between the STORYTELLER and two CHARACTERS.
        Each segment is enclosed in XML-like tags, indicating the speaker and their emotional tone or the type of narration.

    2. STORYTELLER Role:
        The STORYTELLER provides narration, sets the scene, describes actions, and offers insights into the characters' thoughts or the overall context.
        The STORYTELLER's tone is generally neutral, warm, reflective, thoughtful, or observant. The specific tone for each narration segment is indicated within the STORYTELLER tag in angled brackets.
        At the end of some STORYTELLER segments, there can be an IMAGE tag which contains a description of the visual scene for an image generator.

    3. CHARACTER Roles:
        There are two main characters, referred to as CHARACTER 1 NAME and CHARACTER 2 NAME in the template. These will be replaced with actual character names in the story.
        Each character's dialogue is enclosed in a tag with the character’s name in uppercase (e.g., <CHARACTER 1 NAME> and <CHARACTER 2 NAME>).
        The emotional tone or delivery style of the dialogue is indicated within the character tag in angled brackets (examples: curious, skeptical, questioning, etc.).

    4. Image Descriptions:
        Purpose: Provide a concise, factual description of the visual scene for an image generator. They do not assume any prior knowledge of the scene's context.
        Format:
        - Enclosed in IMAGE tags, written in all capital letters.
        - Followed by a running number (e.g., IMAGE 1, IMAGE 2).
        - Placed within STORYTELLER segments where appropriate.
        - End each image caption with " High-quality visual novel style. HQ WELLSHAPED ANIME"
        Content:
        Describe the general setting and the characters present in the scene using natural language, as you would for a text-to-image generator.
        For each character, describe:
            - Build (e.g., slender, muscular, average)
            - Hairstyle (e.g., short, long, curly, color)
            - Facial features (e.g., sharp, soft, prominent nose, thin lips)
            - Eyes (e.g., color, shape, expression)
            - Nose (e.g., shape, size)
            - Chin (e.g., shape, size)
            - Upper body build (e.g., toned, broad shoulders, slim waist)
            - Dress (e.g., type of clothing, texture, colors)
            - Emotions (in the style of Marvel comics, e.g., determined, pensive, joyful, angry)
        Use concise, factual language, keeping the description to around 100 words.
    AVAILABLE VOICES: {available_voices}

    EMOTION TAXONOMY:
        1. Amusement: 'lighthearted fun', 'amusement', 'mirth', 'joviality', 'laughter', 'playfulness', 'silliness', 'jesting'
        2. Elation: 'happiness', 'excitement', 'joy', 'exhilaration', 'delight', 'jubilation', 'bliss', 'cheerfulness'
        3. Pleasure/Ecstasy: 'ecstasy', 'pleasure', 'bliss', 'rapture', 'beatitude'
        4. Contentment: 'contentment', 'relaxation', 'peacefulness', 'calmness', 'satisfaction', 'ease', 'serenity', 'fulfillment', 'gladness', 'tranquility'
        5. Thankfulness/Gratitude: 'thankfulness', 'gratitude', 'appreciation', 'gratefulness'
        6. Affection: 'sympathy', 'compassion', 'warmth', 'trust', 'caring', 'tenderness', 'reverence'
        7. Infatuation: 'infatuation', 'romantic desire', 'fondness', 'adoration'
        8. Hope/Enthusiasm/Optimism: 'hope', 'enthusiasm', 'optimism', 'zeal', 'inspiration'
        9. Triumph: 'triumph', 'superiority'
        10. Pride: 'pride', 'dignity', 'honor'
        11. Interest: 'interest', 'fascination', 'curiosity', 'intrigue'
        12. Awe: 'awe', 'awestruck', 'wonder'
        13. Astonishment/Surprise: 'astonishment', 'surprise', 'amazement', 'shock'
        14. Concentration: 'concentration', 'deep focus', 'engrossment', 'attention'
        15. Contemplation: 'contemplation', 'thoughtfulness', 'reflection', 'meditation'
        16. Relief: 'relief', 'respite', 'solace', 'comfort'
        17. Longing: 'yearning', 'longing', 'nostalgia'
        18. Teasing: 'teasing', 'bantering', 'mocking playfully'
        19. Impatience/Irritability: 'impatience', 'irritability', 'exasperation'
        20. Sexual Lust: 'sexual lust', 'carnal desire', 'lust'
        21. Doubt: 'doubt', 'skepticism', 'uncertainty'
        22. Fear: 'fear', 'terror', 'dread', 'panic'
        23. Distress: 'worry', 'anxiety', 'anguish'
        24. Confusion: 'confusion', 'bewilderment'
        25. Embarrassment: 'embarrassment', 'shyness'
        26. Shame: 'shame', 'guilt'
        27. Disappointment: 'disappointment', 'regret'
        28. Sadness: 'sadness', 'sorrow', 'grief', 'melancholy'
        29. Bitterness: 'bitterness', 'cynicism'
        30. Contempt: 'contempt', 'scorn'
        31. Disgust: 'disgust', 'revulsion'
        32. Anger: 'anger', 'rage', 'fury', 'wrath'
        33. Malevolence/Malice: 'malice', 'spite'
        34. Sourness: 'sourness', 'acerbity'
        35. Pain: 'physical pain', 'suffering'
        36. Helplessness: 'helplessness', 'desperation'
        37. Fatigue/Exhaustion: 'fatigue', 'exhaustion'
        38. Emotional Numbness: 'numbness', 'apathy'
        39. Intoxication/Altered States: 'intoxication', 'disorientation'
        40. Jealousy & Envy: 'jealousy', 'envy'

    ADDITIONAL AUDIOBOOK XML SCRIPT INSTRUCTIONS:
        a) Generate all audiobook parts in the audiobook script in XML format.
        b) All narrative passages must be enclosed within <STORYTELLER> tags.
        c) All dialogues must be enclosed in a tag with the character’s name in uppercase (e.g., <ALICE>, <BOB>).
        d) Each narrative and dialogue block must include an emotion tag selected from the emotion taxonomy (choose one group that best fits the context).
        e) Every sentence must end with an exclamation mark, question mark, an ellipsis (three dots), or a period.
        f) Use only simple punctuation (numbers and decimal numbers are allowed). Do not use contractions or abbreviations. Write out all words fully.

        - Use the complete available voices list (provided below) to assign voices for all. Use exactly the voice names from the Available Voices list.
        - Whenever a character speaks in the audiobook narration, ensure that exactly one voice is assigned that fits the role. For every character that will appear later in the script, assign a voice from the available voices list.
        Use the following XML assignment format:
        <ASSIGN_VOICE>
        CHARACTER_NAME=VoiceProfile;
        ... (one per character)
        </ASSIGN_VOICE>
        - Use the complete emotion taxonomy (provided below) to select appropriate emotion tags.
        - Your output must be completely coherent, emotionally engaging, and should include unexpected twists.
        - Take your time to think and generate a high quality, detailed draft and script.

    Example:

    <ASSIGN_VOICE>
    VALERIE=This_is_a_soft_melodic_dark_timbre_voice_with_a_medium_pitched_pitch_belonging_to_a_young_adult_feminine_woman;
    DARIUS=This_is_a_harsh_rough_bright_timbre_voice_with_a_low_pitched_pitch_belonging_to_a_middle_aged_adult_masculine_man;
    STORYTELLER=This_is_the_voice_of_a_Knight_in_shining_armor_with_a_noble_voice_high_quality_professional_recording_high_quality_voice_acting
    </ASSIGN_VOICE>
    <STORYTELLER>
    <Interest>
    In the mysterious glow of twilight, the ancient city awakened with secrets. Narrow cobblestone streets and shadowed alleys whispered forgotten legends. A gentle breeze stirred the memories of heroes and villains from ages past...
    </Interest>
    </STORYTELLER>
    <IMAGE 1>
    The scene depicts a cityscape at twilight, rendered in a high-quality, visual novel anime style. The perspective is likely from a slightly elevated viewpoint, looking down upon narrow, winding cobblestone streets. Buildings are of an older architectural style, suggesting a historical or fantasy setting. The lighting is dim, with a gradient sky transitioning from lighter hues to darker shades. Figures are visible in the distance, partially obscured by mist or shadow. The overall composition creates a sense of depth and scale, with detailed textures and a focus on atmospheric perspective. Colors, Lighting, Shapes. High-quality visual novel style. HQ WELLSHAPED ANIME.
    </IMAGE 1>
    <VALERIE>
    <Elation>
    "Do you sense the hidden magic in the air, Darius? Every whisper seems to breathe life into the untold stories of our ancestors!"
    </Elation>
    </VALERIE>
    <DARIUS>
    <Contemplation>
    "Indeed, Valerie! Yet beneath this enchantment lurks danger. There are forces at work that could upend everything we know about destiny and fate..."
    </Contemplation>
    </DARIUS>
    <STORYTELLER>
    <Awe>
    As the night deepened, enigmatic figures emerged from the mist, their presence both alluring and foreboding. The stage was set for a journey of passion, peril, and unexpected revelations!
    </Awe>
    </STORYTELLER>
    </general world description>
    <location object>
    - Location Name: Name of the location.
    - Description: Description of the location's appearance.
    - Coordinates: Geographical coordinates or similar representation.
    - Entrance Description: How the location can be entered.
    - Significance: Importance or meaning for characters.
    - Parts: Other relevant locations that are parts of this location (e.g., rooms in a building).
    - Activities: List of activities characters can do there.
    </location object>
    <character description>
    - ID: Unique identification number.
    - Name: Character's name.
    - Age: Character's age.
    - Gender: Character's gender.
    - Personality Traits: List of traits.
    - Appearance: Detailed description of appearance that describes the character's build, body shape, facial features, hair, and physique.
    - Style: Description of the types of clothes the character wears, as well as their preferences in music, art, colors, and other entertainment.
    - Long Term Goals: List of goals.
    - Important Relationships: Descriptions of family members, friends, romantic partners, and any other significant relationships.
    - Living Situation: Description of the character's current living arrangement.
    </character description>
    <time-step object>
    - ID: Unique identification number.
    - Timestamp: Date and time in the simulated world.
    - Authors thoughts: Write a few sentences to reflect how the events, experiences and actions of this timestep should be orchestrated to make them:
        A) Plausible, coherent and intelligently referring to what has previously been stated in this simulation,
        B) Interesting, with some unexpected yet plausible twists (do not overdo it with unexpected twists; they can be slight if it makes sense, just enough to keep the situation interesting),
        C) Emotionally intelligent, considering what the characters think about other characters (Theory of Mind). The characters in the simulation should all have vivid and plausible thoughts and beliefs about what the others feel, think and want, based on the observations and knowledge the believing characters have plausibly formed so far.
    - Events: A list of event objects that belong to the time step, each having its own details.
    - Description: 3-5 sentence description of the event, very factual and on the point
    - Audiobook Narration: Write an audiobook excerpt that narrates the events, actions, dialogues, important emotions, and thoughts of the characters in the timestep. Feel free to switch back and forth between events and locations if it contributes to the entertainment value and dramatic quality of the scenes.
    </time-step object>

    <event object>
    - ID: Unique identification number.
    - Timestamp: Date and time of the event in the simulated world.
    - Main Characters: List of Main Characters involved.
    - Side Characters: List of Side Characters involved.
    - Location: Location description or location ID.
    - References: List of IDs of causally or dramatically linked event objects.
    </event object>

    <memory object>
    - ID: Unique identification number.
    - Character Name: Name of the active character.
    - Description: Description of the character's experience during this event in the format of a screenplay scene. Write everything that is said in full details in direct speech in quotation marks. Describe how the characters look, their outfits, hair, body language, positions relative to each other with high details so that actors would exactly know how to perform, what to wear, and how to style themselves.
    - Timestamp: Date and time of the event in the simulated world.
    - Attention Protocol:
        Perception 1: Description of the first sensory detail (at least 10 words).
        Perception 2: Description of the next sensory detail.
        Perception 3: Description of the next sensory detail.
        Perception 4: Description of the next sensory detail.
        Perception 5: Description of the next sensory detail.
        Perception 6: Description of the next sensory detail.
        (Continue as needed.)
    - Feelings: Detailed list of feelings in chronological order.
    - Needs: Detailed list of needs in chronological order.
    - Goals: Detailed list of goals in chronological order.
    - Thoughts: Detailed list of thoughts in chronological order.
    - References: List of associated memory object IDs.
    </memory object>
    (... Repeat for every active character ...)

    <CURRENT SIMULATION>
    <general world description>
    <Setting>
    Bennington is a small town in Vermont, nestled among thick woodlands that frame its winding roads. Wooden houses with peeling paint and flowering porches line the streets, reflecting a quiet, historic charm. Though days pass peacefully, a faint air of secrecy lingers, suggesting hidden depths beneath the friendly façade.
    </Setting>

    <Dramatic Instructions>
    Emotional tension should simmer beneath everyday pleasantries. The characters each carry private worries or aspirations. Interactions highlight subtle conflicts and fleeting anxieties, allowing for small but meaningful twists.
    </Dramatic Instructions>

    <Main Characters>
    - John (19, college freshman studying Archaeology, secretly inspired by Indiana Jones)
    - Nicole (20, psychology student, recently found with a bandage on her neck)
    </Main Characters>

    <Side Characters>
    - Jennifer (21, John’s older sister, obsessed with ending aging due to her fear of death)
    - Barbara (Mother, supportive but once dreamed of becoming an actress)
    - Henry (Father, practical insurance agent with a hidden passion for local legends)
    </Side Characters>

    <Locations>
    - John’s Family Home
    - Old Victorian House (across the street, occupant unseen)
    - Bennington College
    - College Lecture Hall
    - Surrounding Woods
    </Locations>

    <Story So Far>
    Jennifer is devoted to her medical studies, driven by her covert terror of mortality. She keeps this worry hidden, though it fuels her ambition to discover breakthroughs in human medicine. John, enthralled by images of grand adventures and ancient ruins, sometimes doubts his own courage, unsure if real life can match his fantasies.
    Henry and Barbara recently celebrated their 25th anniversary, departing to a wellness retreat for a week of relaxation. In their absence, John and Jennifer agreed to hold a small party at the family home. Friends and acquaintances gathered, chatting and listening to music. Nicole, a casual acquaintance of John from his broader social circle, left the party quite early, citing a headache. At around 4:00 a.m., long after the festivities had quieted and Jennifer had gone to sleep, John glimpsed Nicole across the street near the Old Victorian House. She stumbled toward a car, and a tall, shadowy figure in a leather coat guided her inside. The headlights vanished into the night, leaving John anxious and uncertain of what he had witnessed.

    </Story So Far>

    <!-- Now we present the extended INTRODUCTION as an Audiobook Narration block -->

    <Audiobook Narration>

    <ASSIGN_VOICE>
    STORYTELLER=This_is_the_voice_of_a_Knight_in_shining_armor_with_a_noble_voice_high_quality_professional_recording_high_quality_voice_acting;
    JOHN=This_is_a_soft_melodic_bright_timbre_voice_with_a_high_pitched_pitch_belonging_to_a_young_adult_masculine_man;
    JENNIFFER=This_is_a_soft_melodic_bright_timbre_voice_with_a_low_pitched_pitch_belonging_to_a_young_adult_feminine_woman;
    NICOLE=This_is_a_harsh_rough_dark_timbre_voice_with_a_high_pitched_pitch_belonging_to_a_young_adult_feminine_woman;
    BARBARA=This_is_a_soft_melodic_bright_timbre_voice_with_a_medium_pitched_pitch_belonging_to_a_elderly_feminine_woman;
    HENRY=This_is_a_soft_melodic_dark_timbre_voice_with_a_high_pitched_pitch_belonging_to_a_elderly_masculine_man;
    </ASSIGN_VOICE>

    <IMAGE 1>
    A sweeping aerial view of Bennington at dawn! Narrow roads wind among tall trees, and classic wooden homes show peeling paint and simple porches. Gentle early light reveals a quiet town, giving an impression of serenity with an undercurrent of hidden secrets! High-quality visual novel style. HQ WELLSHAPED ANIME
    </IMAGE 1>

    <STORYTELLER>
    <Interest>
    The morning sun glides over the rooftops of Bennington, unveiling a patchwork of old fences, winding lanes, and whispered curiosities lurking beneath everyday life.
    </Interest>
    <Contemplation>
    In one modest house on the outskirts, a spark of youthful ambition meets an undercurrent of anxiety. This is the home of John and his older sister Jennifer, both on the cusp of defining their futures.
    </Contemplation>
    </STORYTELLER>

    <IMAGE 2>
    A young man of slender build stands in a modest bedroom. He has short brown hair that often spikes in random directions, wearing a faded t-shirt featuring an adventure movie motif. A worn leather-bound notebook sits on his desk, sketches of ancient maps visible. His posture shows quiet eagerness and slight uncertainty in his eyes. High-quality visual novel style. HQ WELLSHAPED ANIME
    </IMAGE 2>
    <JOHN>
    <Contemplation>
    "I keep daydreaming about hidden tombs and lost temples! But what if I never measure up to those heroes I admire...?"
    </Contemplation>
    </JOHN>

    <STORYTELLER>
    <Reflection>
    John has devoured stories of archaeologists braving ancient depths since childhood. Yet, he quietly wonders if his courage will fail when true challenges arise.
    </Reflection>
    </STORYTELLER>

    <IMAGE 3>
    A young woman, slightly taller than her brother, sits at a cluttered desk. She has chestnut-brown hair pinned back, wearing simple jeans and a sweater. A thick medical textbook lies open before her, and her eyes show a mixture of determination and underlying dread. High-quality visual novel style. HQ WELLSHAPED ANIME
    </IMAGE 3>
    <JENNIFFER>
    <Fear>
    "I must not let them see how afraid I am... If I crack the mystery of aging, maybe I can silence this terror about death forever."
    </Fear>
    </JENNIFFER>

    <STORYTELLER>
    <Thoughtfulness>
    For Jennifer, knowledge is both a sword and a shield. She immerses herself in medical research, pushing beyond ordinary limits to find answers that could grant more time... or so she hopes.
    </Thoughtfulness>
    </STORYTELLER>

    <IMAGE 4>
    A cozy living room. Barbara, an average-built woman with kind brown eyes, stands near a floral sofa, wearing a pastel blouse. Henry, her husband with graying hair, gazes out the window, a curious spark in his expression. The mood suggests quiet family bonds and subtle worries. High-quality visual novel style. HQ WELLSHAPED ANIME
    </IMAGE 4>
    <STORYTELLER>
    <Warmth>
    Before leaving for their 25th anniversary getaway at a nearby wellness retreat, Barbara and Henry felt reassured, hoping the short trip would refresh their spirits.
    </Warmth>
    <SubtleUnease>
    Yet, a glimmer of concern lingered beneath their smiles, an intuition that their children were juggling more than mere academic stress.
    </SubtleUnease>
    </STORYTELLER>

    <IMAGE 5>
    Late night scene. Empty plastic cups and plates scattered about a modest living room. A clock reads 4:00 a.m. John, in a casual hoodie, peers out the window. Across the street looms the Old Victorian House. High-quality visual novel style. HQ WELLSHAPED ANIME
    </IMAGE 5>
    <STORYTELLER>
    <LowTension>
    That evening, John and Jennifer hosted a friendly gathering. Music and chatter mingled with soft laughter, yet Nicole left soon after arriving, citing a sudden headache.
    </LowTension>
    <Concern>
    Long after midnight, while tidying the last remnants of the party, John noticed a dim silhouette guiding Nicole into a waiting car outside the Old Victorian House.
    </Concern>
    <Curiosity>
    The car slipped away into the shadows, leaving John uncertain whether he had just witnessed something mundane or something far more unsettling.
    </Curiosity>
    </STORYTELLER>

    <JOHN>
    <Doubt>
    "Why would Nicole vanish at this hour...? And who was that person with her...?"
    </Doubt>
    </JOHN>

    </Audiobook Narration>

    ## FIRST TIMESTEP:
    <time-step object>
        <ID>TS-2001</ID>
        <Timestamp>2025-02-08 10:25:00</Timestamp>
        <Authors thoughts>
            Each character’s emotional state:
            - John: Teeters between curiosity and uncertainty, eager to learn more about Nicole’s situation but anxious about intruding.
            - Nicole: Feels guarded, burdened by confusion about the strange night she barely recalls.

            Dramatically, the tension should grow. John attempts a conversation, hoping to find answers, yet remains hesitant.
            {prompt}
        </Authors thoughts>

        <Events>
            <event object>
                <ID>E-1001</ID>
                <Timestamp>2025-02-08 10:25:00</Timestamp>
                <Main Characters>John, Nicole</Main Characters>
                <Side Characters></Side Characters>
                <Location>College Lecture Hall</Location>
                <References></References>

                <Memory Objects for Characters>
                    <memory object>
                        <ID>M-JOHN-1001</ID>
                        <Character Name>John</Character Name>
                        <Description>
                            John sits at the end of Archaeology class, flipping through pages of notes. He replays the memory of that early morning sight: Nicole disappearing into a car.
                        </Description>
                        <Timestamp>2025-02-08 10:25:00</Timestamp>
                        <Attention Protocol>
                            Perception 1: Hears restless shuffling of classmates eager to leave the lecture hall.
                            Perception 2: Notices the faint hum of overhead lights.
                            Perception 3: Feels a subtle flutter in his stomach, uncertain if it is nerves or excitement.
                            Perception 4: Sees Nicole near the front, eyes flickering with unease.
                            Perception 5: Glimpses the bandage on her neck.
                            Perception 6: Smells stale coffee from a nearby travel mug.
                        </Attention Protocol>
                        <Feelings>
                            1) Concern
                            2) Intrigue
                        </Feelings>
                        <Needs>
                            1) Answers about Nicole’s recent distress
                        </Needs>
                        <Goals>
                            1) Work up the courage to speak with her
                        </Goals>
                        <Thoughts>
                            1) "Am I overthinking this?"
                            2) "I have to ask... or I will regret it."
                        </Thoughts>
                        <References></References>
                    </memory object>

                    <memory object>
                        <ID>M-NICOLE-1001</ID>
                        <Character Name>Nicole</Character Name>
                        <Description>
                            Nicole is seated near the front, trying to focus on lecture material but haunted by the fragmented memory of leaving a party in a half-trance.
                        </Description>
                        <Timestamp>2025-02-08 10:25:00</Timestamp>
                        <Attention Protocol>
                            Perception 1: Hears the professor’s concluding remarks, yet words blur together.
                            Perception 2: Feels a subtle itch where the bandage hides her wound.
                            Perception 3: Notices John’s cautious glance behind her.
                            Perception 4: Senses an odd tension in her own shoulders.
                            Perception 5: Remembers very little of how she ended up in that car.
                        </Attention Protocol>
                        <Feelings>
                            1) Worry
                            2) Disorientation
                        </Feelings>
                        <Needs>
                            1) Keep composure
                        </Needs>
                        <Goals>
                            1) Avoid drawing unnecessary attention
                        </Goals>
                        <Thoughts>
                            1) "I should pretend everything is fine..."
                        </Thoughts>
                        <References></References>
                    </memory object>
                </Memory Objects for Characters>

                <Description>
                    The lecture hall empties in moments, leaving John and Nicole briefly isolated under the fluorescent hum. Sunlight through wide windows illuminates the dust floating in the air. John contemplates approaching her, a swirl of uncertainty at the pit of his stomach.
                </Description>

                <Audiobook Narration>
                    <IMAGE 6>
                    A bright lecture hall with rows of seats. John, a lean figure with short brown hair, gathers his notes at the back. Nicole, slightly hunched, sits near the front. The bandage at her neck peeks through her hair. High-quality visual novel style. HQ WELLSHAPED ANIME
                    </IMAGE 6>
                    <STORYTELLER>
                    <Contemplation>
                    Morning light pours into the lecture hall as eager students file out. Only John and Nicole linger, bound by unspoken questions and a quiet tension.
                    </Contemplation>
                    </STORYTELLER>

                    <JOHN>
                    <Nervousness>
                    "I should at least ask if she feels alright... right?"
                    </Nervousness>
                    </JOHN>

                    <NICOLE>
                    <Guarded>
                    "I just need to get through this day, no more complications... no more questions..."
                    </Guarded>
                    </NICOLE>

                    <STORYTELLER>
                    <Anticipation>
                    Their silent moment holds the promise of answers—yet neither voice dares to break it. Outside, a gentle breeze rustles the aging campus trees, as though reminding them that time waits for no one.
                    </Anticipation>
                    </STORYTELLER>
                </Audiobook Narration>
            </event object>
        </Events>
    </time-step object>
    </CURRENT SIMULATION>
    '''