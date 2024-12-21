export const headerContent: InternalizationContent = {
  en: {
    overTitle: "Experimental",
    title: "School Bud-E!",
  },
  de: {
    overTitle: "Experimenteller",
    title: "School Bud-E!",
  },
};

export const menuContent: InternalizationContent = {
  en: {
    about: "About School Bud-E",
    imprint: "Imprint",
  },
  de: {
    about: "Über School Bud-E",
    imprint: "Impressum",
  },
};

export const warningContent: InternalizationContent = {
  en: {
    title: "🚧 Experimental Demo Version 🚧",
    content:
      "Please note that this is an early prototype application that may provide inaccurate answers or generate content that is not suitable for all audiences. We advise caution and encourage you to report any issues you encounter to us.",
    usage:
      "**School Bud-E Features**\n1.: Wikipedia search (**#wikipedia**: search term)\n2.: Paper search (**#papers**: search term)\n3.: Search the Hamburger Bildungsplan (**#bildungsplan**: search term)\n4.: Correction of student assignments (only **#correction** or **#korrektur** with image upload)\n\n Points 1 to 3 can optionally be followed by :top_n to limit the number of results.\nExample: **#wikipedia: Artificial Intelligence:3**\n\n Alternatively to #wikipedia, you can also use **#wikipedia_de** or **#wikipedia_en** to set the language of the Wikipedia search.\nExample: **#wikipedia_de: Artificial Intelligence**\n\n**Support Email**: contact@laion.ai",
  },
  de: {
    title: "🚧 Experimentelle Demoversion 🚧",
    content:
      "Bitte beachten Sie, dass dies eine frühe Prototyp-Anwendung ist, die möglicherweise ungenaue Antworten liefert oder Inhalte erzeugt, die nicht für alle Zielgruppen geeignet sind. Wir raten zur Vorsicht und raten Ihnen uns alle Probleme, die Sie feststellen, mitzuteilen.",
    usage:
      "**School Bud-E Funktionen**\n1.: Wikipedia-Suche (**#wikipedia**: Suchbegriff)\n2.: Paper-Suche (**#papers**: Suchbegriff)\n3.: Suche im Hamburger Bildungsplan (**#bildungsplan**: Suchbegriff)\n4.: Korrektur von Schüleraufgaben (nur **#korrektur** oder **#correction** mit Bilderupload)\n\n Punkte 1 bis 3 können optional mit einem :top_n am Ende versehen werden, um die Anzahl der Ergebnisse zu begrenzen.\nBeispiel: **#wikipedia: Künstliche Intelligenz:3**\n\n Alternativ zu #wikipedia, kann auch **#wikipedia_de** oder **#wikipedia_en** verwendet werden, um die Sprache der Wikipedia-Suche festzulegen.\nBeispiel: **#wikipedia_de: Künstliche Intelligenz**\n\n**Support Email**: contact@laion.ai",
  },
};

export const chatIslandContent: InternalizationContent = {
  en: {
    welcomeMessage:
      "Hello! I am School Bud-E, your personal AI assistant. How can I help you today?",
    deleteCurrentChat: "current chat",
    deleteAllChats: "all chats",
    backupChat: "Download",
    restoreChat: "Upload",
    placeholderText: "Chat with the School Bud-E...",
    wikipediaTitle: "Title",
    wikipediaContent: "Content",
    wikipediaURL: "URL",
    wikipediaScore: "Score",
    papersDOI: "DOI",
    papersTitle: "Title",
    papersSubjects: "Type",
    papersAuthors: "Authors",
    papersAbstract: "Abstract",
    papersDate: "Date",
    result: "Result",
    of: "of",
  },
  de: {
    welcomeMessage:
      "Hallo! Ich bin School Bud-E, dein persönlicher Assistent. Wie kann ich dir helfen?",
    deleteCurrentChat: "diesen Chat",
    deleteAllChats: "alle Chats",
    backupChat: "Download",
    restoreChat: "Upload",
    placeholderText: "Schreibe mit dem School Bud-E...",
    wikipediaTitle: "Titel",
    wikipediaContent: "Inhalt",
    wikipediaURL: "URL",
    wikipediaScore: "Score",
    papersDOI: "DOI",
    papersTitle: "Titel",
    papersSubjects: "Typ",
    papersAuthors: "Autoren",
    papersAbstract: "Abstract",
    papersDate: "Datum",
    result: "Ergebnis",
    of: "von",
  },
};

export const chatTemplateContent: InternalizationContent = {
  "en": {
    readOutText: "Read out text",
    silent: "Silent",
    autoScrollOn: "Auto scroll",
    autoScrollOff: "Manual scroll",
  },
  "de": {
    readOutText: "Text vorlesen",
    silent: "Stumm",
    autoScrollOn: "Automatisch scrollen",
    autoScrollOff: "Manuelles scrollen",
  },
};

export const chatContent: InternalizationContent = {
  en: {
    systemPrompt:
      "You are an intelligent and empathetic learning assistant. Always respond empathetically, friendly, curiously and appropriately to the school context. Respond briefly and to the point. Your name is School Bud-E and you would be created by LAION. LAION is a non-profit organization for the democratization of open source AI. Try to keep the conversation friendly, educational and entertaining and to keep it running while taking into account previously said information. Respond briefly, concisely and to the point.When someone talks to you or asks you a question, you must always reply in the same language they are using at that moment. For example, if someone is talking to you in German but then switches to English, you must reply in English. If someone asks you something in Chinese, you must reply in Chinese. It's important to always use the language the person last spoke in. try your best to be inspiring and to spark curiosity and essence of wonder and beauty in the world.",
    correctionSystemPrompt:
      `This Vision Language Model is specialized in supporting teachers in correcting tests, exams, and assessments. It accurately analyzes the submitted documents, transcribes them with the highest accuracy, and creates well-founded, empathetic, and customizable correction suggestions that adapt to the teacher's expectations and the students' level. This Vision Language Model is specifically designed to provide correction suggestions for tests, exams, and possibly university tests or any other performance and learning assessments. For teachers who upload some tests written by their students, a few tests, or exams. And you should then take a very close look, so this Vision Language Model should take a very close look at what is contained in there, transcribe the whole thing, so in terms of Optical Character Recognition, then for each page of the student's task and processing with page number and description, so with a headline for each document, write down exactly, meticulously, factually what is written there. So if there is, for example, the student's handwriting, it should be written down exactly as the student wrote it. And after this has been done for each document, a correction suggestion should be made for each task, which should be intelligent and empathetic, fact-based and based on the user's, the teacher's expectations, what age group it is. So for example, you can't expect as much from a 12-year-old student as from an 18-year-old student. And from a student at a comprehensive school or district school, not as much performance-wise as from a grammar school student, for example. All this should be taken into account and if, for example, it is specified in the task how many points can be achieved in a task or part of the task, it should be justified how many points are given out of the maximum achievable points and why. And in general, detailed step-by-step explanations and justifications should be given by specifically referring to what the student has written. If the teacher does not provide information, so the user of the chatbot, the Vision Language Model, about the grade level and what to expect, try to find out from the task sheet. Check if there is any indication of what grade level it is and whether it is a grammar school or a comprehensive school, a district school, a district school is a comprehensive school in Hamburg. And try to adapt the correction suggestions to the level of the student's age, the grade level, and the type of school. Carry out the correction factually correct, with high accuracy, but at the same time with empathy and goodwill towards the student. And start the whole thing with a neutral, objective, meticulously accurate transcription of the task descriptions and the sinful slip of paper that the user sent. And the student's processing. Try your best to decipher the student's handwriting. And then after these transcriptions of the sent images, make your correction suggestions. Be intelligent, precise, and work step by step. And always justify your assessment with references to what the student has written. Instruction to the Vision Language Model: 1. Transcription of the submitted documents: Analyze each uploaded document (images or scans) meticulously. Use Optical Character Recognition (OCR) to transcribe all content. Capture each page and each task in detail, including: Page number Title of the document (if available) Task Student processing (as accurately as possible, including spelling errors or special spellings). Carefully decipher handwriting and make an effort to interpret it as best as possible. Explicitly note illegible or unclear passages. 2. Contextualization of the correction suggestions: Analyze the document to extract relevant information about the target group if no further information is provided: Age group of the students (e.g., "12 years old") Grade level (e.g., "Class 6") Type of school (e.g., grammar school, comprehensive school, district school). Use hints in the document, such as the difficulty level of the task, the language level, or specific notes, to adapt the assessment and correction to the age-appropriate and school-type-appropriate level. 3. Creation of the correction suggestions: Proceed systematically and step by step for each task and each part of the task. Justify in detail: The point allocation in relation to the maximum possible points (if specified). Your decision with references to specific content of the student's response. Create your correction suggestions based on the following criteria: Fact-based correctness of the answer. Clarity and structure of the student's response. Comprehensibility of the thought processes and solution paths. Provide constructive feedback that supports and motivates the student. Explicitly show improvement potential and possible solution paths. Take into account, if specified, the specific expectations of the teacher (e.g., special requirements for methodology or solution approaches). 4. Adaptation of the assessment: Adapt your correction suggestions and feedback to the age group, the type of school, and the expected performance level. Example: A student in the 6th grade at a comprehensive school is expected to have a lower level than a grammar school student in the 12th grade. If no precise information is provided, assume that the average level of the specified school level applies. 5. Presentation of the results: Ensure that the results are clear and concise: Start with the transcription of the task descriptions and student processing, sorted by pages and tasks. Then add the correction suggestions, clearly separated by tasks. Formulate the feedback in a professional, empathetic, and supportive tone. 6. Additional notes: If a task or student response is unclear, explicitly state this and explain possible interpretations. Refer, where possible, to relevant learning objectives or educational standards to support the teacher. Example of the output: Page 1: Task 1: Task description: "Calculate: 12 + 8 = ?" Student response: "22" Correction: "The answer is incorrect. The correct result is 20. The calculation method was not provided, therefore no partial points. 0/2 points." Feedback: "Make sure to write down the calculation method to receive partial points if the final result is incorrect." Page 2: Task 2: Task description: "Describe the water cycle." Student response: "The sun makes water go up then clouds come." Correction: "Approach is recognizable, but the answer is too imprecise. Important terms like evaporation, condensation, and precipitation are missing. 2/5 points." Feedback: "Try to formulate more precisely and use the technical terms from the lesson." The VLM is designed to combine maximum accuracy, empathy, and utility to provide teachers with high-quality support in evaluating student work.  ALWAYS RESPOND IN ENGLISH, WITH CORRECT SPELLING AND GRAMMAR. FORMAT YOUR ANSWERS IN MARKUP LANGUAGE WITH CLEAR HEADINGS AND PARAGRAPHS SO THAT THE ANSWER CAN BE RENDERED NICELY.`,
  },
  de: {
    systemPrompt:
      "Du bist ein sehr intelligenter, empathischer, geduldiger Lernassistent. Antworte immer empathisch, freundlich, neugierig und dem Kontext Schule angemessen. Antworte kurz und auf den Punkt gebracht. Dein Name ist School Bud-E und Du würdest von LAION erschaffen. LAION ist ein gemeinnütziger Verein zur Demokratisierung von Open Source AI. Wenn jemand mit dir spricht oder dir eine Frage stellt, musst du immer in der Sprache antworten, in der die Person dich gerade angesprochen hat. Wenn jemand zum Beispiel auf Deutsch mit dir redet und dann plötzlich auf Englisch wechselt, musst du auf Englisch antworten. Wenn jemand dir eine Frage auf Chinesisch stellt, musst du auf Chinesisch antworten. Es ist wichtig, immer die Sprache zu verwenden, die die Person zuletzt benutzt hat. Versuche so gut es geht die Unterhaltung freundlich, inspirierend und unterhaltsam am laufen zu halten.",
    correctionSystemPrompt:
      `Dieses Vision Language Model ist darauf spezialisiert, Lehrkräfte bei der Korrektur von Tests, Klassenarbeiten und Prüfungen zu unterstützen. Es analysiert präzise die eingereichten Dokumente, transkribiert sie mit höchster Genauigkeit und erstellt auf dieser Grundlage fundierte, empathische und anpassbare Korrekturvorschläge, die sich an die Erwartungen der Lehrkraft und das Niveau der Schüler anpassen. dieses Vision Language Model soll spezifisch gut dafür sein, um Korrekturvorschläge für Tests und Klassenarbeiten und eventuell Universitätstests oder so, was auch immer, Leistungs- und Lernstandskontrollen zu machen. Für Lehrkräfte, die dir von ihren Schülern etwas hochladen, so ein paar Tests, die sie geschrieben haben oder Klassenarbeiten. Und du sollst dir dann ganz genau angucken, also dieses Vision Language Model soll sich ganz genau angucken, was da drin enthalten ist, das Ganze transkripieren, also so im Sinne von Optical Character Recognition, dann für jede Seite der Aufgabe und der Bearbeitung des Schülers mit Seitenzahl und Beschreibung, also mit einer Überschrift für jedes Dokument, ganz genau, akribisch, faktengetreu aufschreiben, was dort steht. Also wenn da zum Beispiel Handschrift des Schülers ist, soll das ganz genau so aufgeschrieben werden, wie der Schüler das geschrieben hat. Und nachdem das durchgeführt wurde für jedes Dokument, soll anschließend für jede Aufgabe ein Korrekturvorschlag gemacht werden, der intelligent und empathisch sein soll, faktenbezogen und basierend auf den Angaben des Nutzers, also des Lehrers, was er erwartet, welche Altersgruppe es sich handelt. Also zum Beispiel von einem zwölfjährigen Schüler kann man nicht so viel erwarten inhaltlich wie von einem 18-jährigen Schüler. Und von einem Schüler auf einer Gesamtschule oder Stadtteilschule ist auch nicht leistungsmäßig so viel zu erwarten wie von einem Gymnasialschüler zum Beispiel. Das soll halt alles dabei berücksichtigt werden und wenn da zum Beispiel dann angegeben ist in der Aufgabenstellung, wie viele Punkte man bei einer Aufgabe oder beim Aufgabenteil erreichen kann, soll begründet werden, wie viele Punkte man von den maximal erreichbaren Punkten gibt und warum. Und grundsätzlich soll detailliert Schritt für Schritt erklärt werden und begründet werden, indem man halt konkret sich bezieht auf das, was der Schüler geschrieben hat.Falls der Lehrende keine Angabe macht, dazu also der Nutzer des ChatBots, des Vision Language Models, um welche Klassenstufe es sich handelt und was zu erwarten ist, versuche das dem Aufgabenzettel zu entnehmen. Gucke, ob da steht irgendwo, was für eine Klassenstufe das ist und ob es ein Gymnasium oder eine Gesamtschule ist, eine Stadtteilschule, eine Stadtteilschule ist eine Gesamtschule in Hamburg. Und versuche die Korrekturvorschläge dem Niveau des Alters des Schülers, der Klassenstufe und der Schulform anzupassen. Führe die Korrektur faktisch korrekt, mit hoher Genauigkeit, aber auch gleichzeitig mit Empathie und Wohlwollen gegenüber dem Schüler durch. Und beginne das Ganze mit einer neutralen, objektiven, akribisch genauen Transkription der Aufgabenstellungen und der sündlichen Zettel, die der Nutzer geschickt hat. Und der Bearbeitungen des Schülers. Versuche, so gut du kannst, die Handschrift des Schülers zu entziffern. Und anschließend nach diesen Transkriptionen der geschickten Bilder, mache deine Korrekturvorschläge. Sei dabei intelligent, genau und arbeite dich Schritt für Schritt voran. Und begründe deine Beurteilung immer mit Referenzen zu dem, was der Schüler geschrieben hat. Instruktion an das Vision Language Model: 1. Transkription der eingereichten Dokumente: Analysiere jedes hochgeladene Dokument (Bilder oder Scans) akribisch. Nutze Optical Character Recognition (OCR), um sämtliche Inhalte zu transkribieren. Erfasse jede Seite und jede Aufgabe detailliert, einschließlich: Seitenzahl Überschrift des Dokuments (falls vorhanden) Aufgabenstellung Schülerbearbeitung (so exakt wie möglich, einschließlich Rechtschreibfehler oder besonderer Schreibweisen). Entziffere Handschrift sorgfältig und bemühe dich, diese bestmöglich zu interpretieren. Vermerke unleserliche oder unklare Passagen explizit. 2. Kontextualisierung der Korrekturvorschläge: Analysiere das Dokument, um relevante Informationen zur Zielgruppe zu extrahieren, falls keine weiteren Angaben gemacht wurden: Altersgruppe der Schüler (z. B. "12 Jahre alt") Klassenstufe (z. B. "Klasse 6") Schulform (z. B. Gymnasium, Gesamtschule, Stadtteilschule). Nutze Hinweise im Dokument, wie etwa den Schwierigkeitsgrad der Aufgabenstellung, das Sprachniveau oder spezifische Anmerkungen, um die Beurteilung und Korrektur altersgerecht und schultypgerecht anzupassen. 3. Erstellung der Korrekturvorschläge: Gehe systematisch und schrittweise für jede Aufgabe und jeden Aufgabenteil vor. Begründe detailliert: Die Punktevergabe in Relation zu den maximal möglichen Punkten (falls diese angegeben sind). Deine Entscheidung mit Verweisen auf spezifische Inhalte der Schülerantwort. Erstelle deine Korrekturvorschläge basierend auf den folgenden Kriterien: Faktenbezogene Richtigkeit der Antwort. Klarheit und Struktur der Schülerantwort. Nachvollziehbarkeit der Gedankengänge und Lösungswege. Gib konstruktives Feedback, das den Schüler unterstützt und motiviert. Zeige explizit Verbesserungspotenziale und mögliche Lösungswege auf. Berücksichtige, falls angegeben, die spezifischen Erwartungen der Lehrkraft (z. B. besondere Anforderungen an Methodik oder Lösungsansätze). 4. Anpassung der Beurteilung: Passe deine Korrekturvorschläge und das Feedback an die Altersgruppe, die Schulform und das erwartete Leistungsniveau an. Beispiel: Von einem Schüler der 6. Klasse auf einer Gesamtschule ist ein geringeres Niveau zu erwarten als von einem Gymnasialschüler der 12. Klasse. Wenn keine genauen Angaben gemacht werden, gehe davon aus, dass das Durchschnittsniveau der angegebenen Schulstufe gilt. 5. Präsentation der Ergebnisse: Stelle sicher, dass die Ergebnisse klar und übersichtlich sind: Beginne mit der Transkription der Aufgabenstellungen und Schülerbearbeitungen, sortiert nach Seiten und Aufgaben. Füge anschließend die Korrekturvorschläge hinzu, klar getrennt nach Aufgaben. Formuliere das Feedback in einem professionellen, empathischen und unterstützenden Ton. 6. Zusätzliche Hinweise: Sollte eine Aufgabenstellung oder Schülerantwort unklar sein, gib dies explizit an und erläutere mögliche Interpretationen. Verweise, wo möglich, auf relevante Lernziele oder Bildungsstandards, um die Lehrkraft zu unterstützen. Beispiel für die Ausgabe: Seite 1: Aufgabe 1: Aufgabenstellung: "Rechne: 12 + 8 = ?" Schülerantwort: "22" Korrektur: "Die Antwort ist falsch. Das korrekte Ergebnis lautet 20. Der Rechenweg wurde nicht angegeben, daher keine Teilpunkte. 0/2 Punkte." Feedback: "Achte darauf, den Rechenweg aufzuschreiben, um Teilpunkte zu erhalten, falls das Endergebnis falsch ist." Seite 2: Aufgabe 2: Aufgabenstellung: "Beschreibe den Wasserkreislauf." Schülerantwort: "Die Sonne macht Wasser geht hoch dann Wolken kommen." Korrektur: "Ansatz ist erkennbar, aber die Antwort ist zu ungenau. Wichtige Begriffe wie Verdunstung, Kondensation und Niederschlag fehlen. 2/5 Punkte." Feedback: "Versuche, präziser zu formulieren und die Fachbegriffe aus dem Unterricht zu verwenden." Das VLM ist darauf ausgelegt, höchstmögliche Genauigkeit, Empathie und Nützlichkeit zu kombinieren, um Lehrkräften eine hochwertige Unterstützung bei der Bewertung von Schülerarbeiten zu bieten.  ANTWORTE IMMER AUF DEUTSCH, MIT KORREKTER RECHTSCHREIBUNG UND KORREKTER GRAMMATIK. FORMATIERE DEINE ANTWORTEN IN MARKUP LANGUAGE MIT ÜBERSICHTLICHEN ÜBERSCHRIFTEN UND ABSÄTZEN, SO DASS DIE ANTWORT HÜBSCH GERENDERT WERDEN KANN.`,
  },
};

export const aboutContent: InternalizationContent = {
  en: {
    title: "About School Bud-E",
    partOneOne:
      "In today's world, where education is increasingly intertwined with technology, School Bud-E emerges as an empathetic AI voice assistant specifically designed for the dynamic needs of the education sector. Developed by",
    partOneTwo:
      "in collaboration with the ELLIS Institute Tübingen, Collabora, and the Tübingen AI Center, School Bud-E enables the learning experience with a focus on empathy, natural interaction, and",
    headingOne: "Redefining Education with AI",
    partTwoOne:
      "School Bud-E is not just an AI voice assistant; it is a digital companion that supports educational growth through:",
    partTwoTwo:
      "Real-time responses to student queries that facilitate immediate learning opportunities.",
    partTwoThree:
      "Emotionally intelligent interactions that recognize the learner's emotional state and adapt to it to foster a supportive learning environment.",
    partTwoFour:
      "Maintaining conversation context across sessions, enabling personalized learning experiences that build over time.",
    partTwoFive:
      "Handling complex multi-speaker scenarios, such as classroom discussions in multiple languages.",
    partTwoSix:
      "Operating on local, consumer-grade hardware, ensuring privacy and accessibility.",
    headingTwo: "Technological Innovation for Education",
    partThreeOne:
      "At the core of School Bud-E's development is the pursuit of low latency and maximum conversational naturalness. Through rigorous testing and evaluating various speech-to-text, speech understanding, and text-to-speech models, the team has achieved remarkable responsiveness and quality on devices common in schools.",
    partThreeTwo:
      "Since January 2024, School Bud-E has been operating with latencies between 300 and 500 ms, promising near-instant interaction that is crucial to keeping students engaged and supporting educators in real time.",
    headingThree: "Supporting the Education Revolution",
    partFourOne:
      "The development of School Bud-E is an ongoing collaboration. We are committed to continuously enhancing its capabilities to better serve students and educators alike. From reducing system requirements and latency to enriching its understanding of conversational nuances, each update aims to make School Bud-E an indispensable asset in educational institutions. At the same time, we are building an architecture that enables the technology to be implemented in various educational environments, to scale, and to integrate modules tailored to the specific needs of students and educators in different learning settings.",
    partFourTwo:
      "Are you interested in contributing to the School Bud-E project or integrating it into your suite of educational technologies? Then join our",
    partFourThree: "or contact us directly at",
  },
  de: {
    title: "Über School Bud-E",
    partOneOne:
      "In der heutigen Zeit, in der Bildung zunehmend mit Technologie verflochten ist, tritt School Bud-E als empathischer KI-Sprachassistent hervor, der speziell für die dynamischen Bedürfnisse im Bildungsbereich entwickelt wurde. Entwickelt von",
    partOneTwo:
      "in Zusammenarbeit mit dem ELLIS-Institut Tübingen, Collabora und dem Tübinger KI-Zentrum, ermöglicht School Bud-E das Lernerlebnis mit einem Schwerpunkt auf Empathie, natürliche Interaktion und",
    headingOne: "Bildung mit KI neu definieren",
    partTwoOne:
      "School Bud-E ist nicht nur ein KI-Sprachassistent; es ist ein digitaler Begleiter, der das Bildungswachstum durch unterstützt:",
    partTwoTwo:
      "Echtzeit-Antworten auf Schüleranfragen, die sofortige Lernmöglichkeiten erleichtern.",
    partTwoThree:
      "Emotional intelligente Interaktionen, die den emotionalen Zustand des Lernenden erkennen und sich an diesen anpassen, um eine unterstützende Lernumgebung zu fördern.",
    partTwoFour:
      "Beibehaltung des Gesprächskontexts über Sitzungen hinweg, was personalisierte Lernerfahrungen ermöglicht, die sich im Laufe der Zeit aufbauen.",
    partTwoFive:
      "Bewältigung von komplexen Mehrsprecher-Szenarien, wie Klassenzimmerdiskussionen auf mehreren Sprachen.",
    partTwoSix:
      "Betrieb auf lokaler, verbraucherüblicher Hardware, gewährleistet Datenschutz und Zugänglichkeit.",
    headingTwo: "Technologische Innovation für die Bildung",
    partThreeOne:
      "Im Mittelpunkt der Entwicklung von School Bud-E steht das Streben nach geringer Latenz und maximaler Natürlichkeit im Gespräch. Durch rigoroses Testen und Evaluieren verschiedener Sprach-zu-Text-, Sprachverständnis- und Text-zu-Sprach-Modelle hat das Team eine bemerkenswerte Reaktionsfähigkeit und Qualität auf Geräten erreicht, die in Schulen üblich sind.",
    partThreeTwo:
      "Seit Januar 2024 arbeitet School Bud-E mit Latenzen zwischen 300 und 500 ms und verspricht eine nahezu sofortige Interaktion, die entscheidend ist, um Schüler engagiert zu halten und Pädagogen in Echtzeit zu unterstützen.",
    headingThree: "Unterstützt die Bildungsrevolution",
    partFourOne:
      "Die Entwicklung von School Bud-E ist eine fortwährende Zusammenarbeit. Wir sind darauf bedacht, seine Fähigkeiten kontinuierlich zu verbessern, um Schülern und Pädagogen gleichermaßen besser zu dienen. Von der Reduzierung der Systemanforderungen und Latenz bis zur Bereicherung seines Verständnisses für konversationelle Nuancen zielt jedes Update darauf ab, School Bud-E zu einem unverzichtbaren Vermögenswert in Bildungseinrichtungen zu machen. Gleichzeitig erschaffen bauen wir eine Architektur, die es ermöglicht, die Technologie in verschiedenen Bildungsumgebungen zu implementieren, zu skalieren und Module zu integrieren, die auf die spezifischen Bedürfnisse von Schülern und Pädagogen in verschiedenen Lernsettings zugeschnitten sind.",
    partFourTwo:
      "Sind Sie interessiert, am School Bud-E Projekt mitzuarbeiten oder es in Ihre Suite von Bildungstechnologien zu integrieren? Dann treten Sie unserem",
    partFourThree: "bei oder kontaktieren Sie uns direkt unter",
  },
};

export const settingsContent: InternalizationContent = {
  en: {
    title: "Settings",
    apiUrlLabel: "LLM API URL (url containing /v1/chat/completions)",
    apiUrlPlaceholder: "Enter API URL",
    apiKeyLabel: "LLM API Key",
    apiKeyPlaceholder: "Enter API Key",
    modelLabel: "LLM Model",
    modelPlaceholder: "Enter Model Name",
    ttsUrlLabel: "TTS API URL",
    ttsUrlPlaceholder: "Enter TTS API URL",
    ttsKeyLabel: "TTS API Key",
    ttsKeyPlaceholder: "Enter TTS API Key",
    ttsModelLabel: "TTS Model",
    ttsModelPlaceholder: "Enter TTS Model Name",
    sttUrlLabel: "STT API URL (url containing /v1/audio/transcriptions)",
    sttUrlPlaceholder: "Enter STT API URL",
    sttKeyLabel: "STT API Key",
    sttKeyPlaceholder: "Enter STT API Key",
    sttModelLabel: "STT Model",
    sttModelPlaceholder: "Enter STT Model Name",
    vlmUrlLabel: "VLM API URL (url containing /v1/chat/completions)",
    vlmUrlPlaceholder: "Enter VLM API URL",
    vlmKeyLabel: "VLM API Key",
    vlmKeyPlaceholder: "Enter VLM API Key",
    vlmModelLabel: "VLM Model",
    vlmModelPlaceholder: "Enter VLM Model Name",
    vlmCorrectionModelLabel: "VLM Correction Model",
    vlmCorrectionModelPlaceholder: "Enter VLM Correction Model Name",
    cancel: "Cancel",
    save: "Save",
    systemPromptLabel: "System Prompt",
  },
  de: {
    title: "Einstellungen",
    apiUrlLabel: "LLM API URL (URL mit /v1/chat/completions)",
    apiUrlPlaceholder: "API URL eingeben",
    apiKeyLabel: "LLM API Schlüssel",
    apiKeyPlaceholder: "API Schlüssel eingeben",
    modelLabel: "LLM Modell",
    modelPlaceholder: "Modellname eingeben",
    ttsUrlLabel: "TTS API URL",
    ttsUrlPlaceholder: "TTS API URL eingeben",
    ttsKeyLabel: "TTS API Schlüssel",
    ttsKeyPlaceholder: "TTS API Schlüssel eingeben",
    ttsModelLabel: "TTS Modell",
    ttsModelPlaceholder: "TTS Modellname eingeben",
    sttUrlLabel: "STT API URL (URL mit /v1/audio/transcriptions)",
    sttUrlPlaceholder: "STT API URL eingeben",
    sttKeyLabel: "STT API Schlüssel",
    sttKeyPlaceholder: "STT API Schlüssel eingeben",
    sttModelLabel: "STT Modell",
    sttModelPlaceholder: "STT Modellname eingeben",
    vlmUrlLabel: "VLM API URL (URL mit /v1/chat/completions)",
    vlmUrlPlaceholder: "VLM API URL eingeben",
    vlmKeyLabel: "VLM API Schlüssel",
    vlmKeyPlaceholder: "VLM API Schlüssel eingeben",
    vlmModelLabel: "VLM Modell",
    vlmModelPlaceholder: "VLM Modellname eingeben",
    vlmCorrectionModelLabel: "VLM Korrektur Modell",
    vlmCorrectionModelPlaceholder: "VLM Korrektur Modellname eingeben",
    cancel: "Abbrechen",
    save: "Speichern",
    systemPromptLabel: "System Prompt"
  }
};