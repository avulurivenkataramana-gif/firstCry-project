// @desc    Generate AI lesson plan
// @route   POST /api/ai/generate
// @access  Private
exports.generateLesson = async (req, res) => {
  try {
    const { theme, ageGroup, learningOutcome, topic } = req.body;

    if (!theme || !ageGroup || !learningOutcome || !topic) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide theme, ageGroup, learningOutcome, and topic.' 
      });
    }

    // Simulated network delay for realistic AI generation feel (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Compile dynamic, highly professional content based on prompt
    const generatedContent = generatePreschoolCurriculum(theme, ageGroup, learningOutcome, topic);

    res.status(200).json({
      success: true,
      data: generatedContent
    });
  } catch (error) {
    console.error('AI Generator error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Local Early Childhood Education AI Curriculum Engine
function generatePreschoolCurriculum(theme, ageGroup, learningOutcome, topic) {
  // Normalize strings for matching
  const tTheme = theme.toLowerCase();
  const tTopic = topic.toLowerCase();

  // Create placeholders that are pre-filled with context-aware text
  let storyTitle = `The Adventures of Sparky and friends: ${topic}`;
  let storyContent = `Once upon a time, in a magical land where the theme was all about ${theme}, there lived a little character who wanted to explore ${topic}. They set off with their friends, using their senses to observe everything around them. Along the way, they practiced ${learningOutcome}, which helped them solve a grand puzzle and return home safely, showing all the other animals what they learned.`;
  
  let rhymeTitle = `The Happy ${topic} Song`;
  let rhymeContent = `(Tune: Twinkle Twinkle Little Star)\n\nLook at the ${topic}, shining bright,\nHelping us learn with all our might.\nIn the theme of ${theme} we play,\nGrowing stronger every day.\nClap your hands and sing along,\nThis is our early learning song!`;
  
  let activities = [
    {
      title: 'Sensory Exploration Tray',
      description: `Set up a tub themed around ${theme}. Place tactile items related to ${topic} (e.g. textured cutouts, water beads, sand). Children sort them using scoops and spoons.`,
      skills: 'Fine Motor skills, Sensory sorting, Hand-eye coordination'
    },
    {
      title: 'Gross Motor Mimic Game',
      description: `Create a path on the floor representing ${theme}. Children hop, crawl, or skip to reach cards illustrating different aspects of ${topic}, acting out actions upon arrival.`,
      skills: 'Gross Motor Skills, Spatial Awareness'
    }
  ];

  let worksheets = [
    {
      title: `Match the ${topic} Elements`,
      description: `Draw lines linking various items from the ${theme} theme to their matching shapes or numbers.`,
      elements: ['Line-tracing paths', 'Coloring sections', 'Count-and-match column']
    },
    {
      title: `My Creative ${theme} Coloring Sheet`,
      description: `An outline drawing showcasing children engaging with ${topic}. Children decorate using finger-painting or sponge dabs.`,
      elements: ['Large clear borders', 'Texture templates (glue/sand)', 'Outcome stamp area']
    }
  ];

  let assessments = [
    `Observe child's ability to explain in their own words what a ${topic} is.`,
    `Check if the child can classify at least 3 items belonging to the ${theme} category.`,
    `Verify fine motor coordination during the ${topic} finger-painting exercise.`
  ];

  let materials = [
    `Safety scissors and colored construction papers`,
    `Sensory tub filled with elements matching ${theme}`,
    `Flashcards representing ${topic}`,
    `Washable finger paints & painting aprons`
  ];

  let engagementTips = [
    `Begin circle time by making a sound effect or using a hand-puppet related to ${topic}.`,
    `Ask open-ended questions like: 'If you were in ${theme}, how would you feel?'`,
    `Encourage children to turn to a partner and share their favorite item from today's lesson.`
  ];

  // Tailored presets for common preschool themes
  if (tTheme.includes('water') || tTheme.includes('sea') || tTheme.includes('rain') || tTheme.includes('weather')) {
    storyTitle = `The Little Raindrop's Grand Sea Journey`;
    storyContent = `Splish, splash! Pip the Raindrop fell from a soft grey cloud. He landed on a leaf, slid down into a tiny stream, and began an exciting journey to the ocean. Along the way, Pip met Shelly the Crab, who was looking for colorful sea pebbles. Shelly showed Pip how to float on top of the water and dive deep below. Pip learned that everything in nature has a special cycle. By the time Pip reached the big blue sea, he had helped three different plants grow and made friends with a school of glowing fish!`;
    
    rhymeTitle = `Pitter Patter Raindrops`;
    rhymeContent = `(Tune: Row, Row, Row Your Boat)\n\nRain, rain, fall today,\nWash the dust away.\nPitter-patter, pitter-patter,\nChildren shout, 'Hooray!'\n\nBoats, boats, float along,\nSing a happy song.\nFloating down the little stream,\nAll the summer long!`;

    activities = [
      {
        title: 'Float or Sink Sensory Station',
        description: `Fill a large water basin. Gather objects of different densities (wooden blocks, metal spoons, leaves, plastic toys). Let kids take turns predicting and testing if each object floats or sinks, celebrating their findings.`,
        skills: 'Scientific Inquiry, Critical Thinking, Observation'
      },
      {
        title: 'Sponge Puddle Jumpers',
        description: `Place flat blue sponges on the floor like stepping stones. Play rainy day music. Children hop from sponge 'puddle' to puddle to develop physical balance, stopping when the music stops.`,
        skills: 'Balance, Gross Motor Skills, Auditory Listening'
      }
    ];

    worksheets[0] = {
      title: 'Water Cycle Connect-the-Dots',
      description: 'Trace the path of Pip the raindrop from the cloud down to the flower, and back up as vapor.',
      elements: ['Numbered dots 1 to 10', 'Cloud and flower outline illustrations', 'Raindrop emoji stamp area']
    };

    assessments = [
      'Can the child differentiate between objects that float and objects that sink?',
      'Can the child mimic the sound of rain using shaker instruments?',
      'Did the child display balance when jumping across the sponge puddles?'
    ];
  } else if (tTheme.includes('community') || tTheme.includes('helper') || tTheme.includes('doctor') || tTheme.includes('job')) {
    storyTitle = `Officer Bruno's Missing Whistle`;
    storyContent = `Officer Bruno, the friendly neighborhood police officer, woke up ready to help his community. But oh no! His silver whistle was missing. He walked down Main Street and asked Dr. Clara, who was busy checking a teddy bear's heartbeat. 'I haven't seen it, Bruno, but let me check your ears just in case!' she smiled. Bruno then asked Firefighter Sam, who was polishing the big red fire engine. Sam searched the truck and found the whistle tucked inside Sam's safety boot! Bruno blew his whistle happily, thanking Sam. The helpers realized that by working together, they keep the neighborhood safe and happy.`;

    rhymeTitle = `The Helpful Neighbors`;
    rhymeContent = `(Tune: The Wheels on the Bus)\n\nOur friendly doctors make us well, make us well, make us well,\nOur friendly doctors make us well, all through the town.\n\nThe firefighters put out fires, put out fires, put out fires,\nThe firefighters put out fires, all through the town.\n\nWe all help each other out, help each other out, help each other out,\nWe all help each other out, all through the town!`;

    activities = [
      {
        title: 'Emergency Vehicle Roll-Play',
        description: `Set up tape lanes on the carpet. Children hold cardboard cut-outs of ambulances, fire trucks, and police cars. Teach them the difference between siren sounds and when to yield.`,
        skills: 'Social Coordination, Role Playing, Sound Association'
      },
      {
        title: 'Band-Aid Matching Board',
        description: `Children use plastic tweezers to grab real Band-Aids and stick them onto matching colored dots on a custom doctor-chart, aiding fine-motor grip.`,
        skills: 'Fine Motor Control, Color Recognition, Hand Strength'
      }
    ];

    assessments = [
      'Can the child name at least three community helpers and describe what they do?',
      'Did the child show empathy during the doctor role-play activity?',
      'Was the child able to use the tweezers to match Band-Aids accurately?'
    ];
  } else if (tTheme.includes('animal') || tTheme.includes('farm') || tTheme.includes('jungle') || tTheme.includes('pet')) {
    storyTitle = `The Barnyard Concert`;
    storyContent = `Barnaby the Donkey loved to sing, but his voice was a loud 'HEE-HAW!' The other farm animals thought it was too noisy. One afternoon, Clara the Cow wanted to sing a lullaby to her sleepy calf, but she lost her voice. Barnaby stepped in and hummed a soft, gentle donkey-beat. Penny the Pig began to snort in rhythm, and Pip the Chick peeped along. Together, they created the first Barnyard Band! They realized every animal has a unique sound, and when blended together, it makes a beautiful symphony.`;

    rhymeTitle = `Old MacDonald's Jungle Farm`;
    rhymeContent = `(Tune: Old MacDonald Had a Farm)\n\nOld MacDonald had a farm, E-I-E-I-O,\nAnd on that farm he had a lion, E-I-E-I-O,\nWith a ROAR-ROAR here, and a ROAR-ROAR there,\nHere a roar, there a roar, everywhere a roar-roar!\nOld MacDonald had a farm, E-I-E-I-O!`;

    activities = [
      {
        title: 'Animal Track Clay Press',
        description: `Provide children with playdough and plastic toy animals. Children press the toy feet into clay to inspect different animal track shapes (claws vs hooves vs webbed feet).`,
        skills: 'Fine Motor Skills, Scientific Inquiry, Textures'
      },
      {
        title: 'Monkey Vine Swingers',
        description: `Hang soft green ropes from safety bars (or layout chalk lines). Children balance along the 'vines' while holding a stuffed monkey, pretending to traverse the jungle canopy.`,
        skills: 'Balance, Motor Planning, Imagination'
      }
    ];

    assessments = [
      'Can the child correctly pair the plastic animal with the track it leaves in the clay?',
      'Is the child able to imitate wild vs domestic animal sounds on cue?',
      'Did the child participate cooperatively in the group Barnyard Band concert?'
    ];
  }

  // General adjustments based on Age Group
  let ageAdjustedTips = [...engagementTips];
  if (ageGroup.includes('2-3') || ageGroup.toLowerCase().includes('toddler')) {
    ageAdjustedTips.push('Keep instructions under two steps. Toddlers respond best to physical gesture demonstrations.');
    activities.forEach(a => a.title = `[Toddler Friendly] ${a.title}`);
  } else if (ageGroup.includes('4-5') || ageGroup.toLowerCase().includes('kindergarten')) {
    ageAdjustedTips.push('Incorporate simple spelling or counting challenges (e.g. asking children to count to 15 during the activity).');
  }

  return {
    meta: {
      theme,
      ageGroup,
      learningOutcome,
      topic,
      generatedDate: new Date().toLocaleDateString()
    },
    lessonPlan: {
      title: `AI Curated Plan: ${topic}`,
      duration: ageGroup.includes('2-3') ? '25-30 mins' : '40-45 mins',
      objectives: [
        `Introduce the core concept of ${topic} through sensory aids`,
        `Achieve outcome: ${learningOutcome}`,
        `Promote collaborative peer play inside the theme of ${theme}`
      ],
      flow: [
        { time: '00:00-00:05', activity: 'Circle Time introduction with puppet hook' },
        { time: '00:05-00:15', activity: 'Storytelling session & Interactive Q&A' },
        { time: '00:15-00:35', activity: `Main Hands-on Activity: ${activities[0].title}` },
        { time: '00:35-00:40', activity: 'Rhyme rehearsal and transition check' }
      ]
    },
    story: {
      title: storyTitle,
      content: storyContent
    },
    rhyme: {
      title: rhymeTitle,
      content: rhymeContent
    },
    activities,
    worksheets,
    assessments,
    materials,
    engagementTips: ageAdjustedTips
  };
}
