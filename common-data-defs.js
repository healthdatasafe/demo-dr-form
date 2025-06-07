
const patientBaseStreams = [
  // profile
  {id: 'profile', name: 'Profile'},
  {id: 'profile-name', name: 'Name', parentId: 'profile'},
  {id: 'profile-address', name: 'Address', parentId: 'profile'},
  {id: 'profile-date-of-birth', name: 'Date of Birth', parentId: 'profile'},
  {id: 'profile-location', name: 'Location', parentId: 'profile'},
  {id: 'profile-sex', name: 'Sex', parentId: 'profile'},
  // family
  {id: 'family', name: 'Family'},
  {id: 'family-children', name: 'Children', parentId: 'family'},
  // fertility
  {id: 'fertility', name: 'Fertility'},
  {id: 'fertility-miscarriages', name: 'Miscarriages', parentId: 'fertility'},
  {id: 'fertility-trainings', name: 'Trainings', parentId: 'fertility'},
  {id: 'fertility-cycles', name: 'Cycles', parentId: 'fertility'},
  {id: 'fertility-cycles-start', name: 'New Cycle', parentId: 'fertility-cycles'},
  {id: 'fertility-cycles-ovulation', name: 'Ovulation Day', parentId: 'fertility-cycles'},
  {id: 'fertility-cycles-charted-estimation', name: 'Cycles charted estimation', parentId: 'fertility-cycles'},
  {id: 'fertility-ttc-tta', name: 'Goal: trying to conceive or avoid pregnancy', parentId: 'fertility'},
  // endometriosis
  {id: 'endometriosis', name: 'Endometriosis'},
  {id: 'endometriosis-autoimmune', name: 'Personal history of autoimmune conditions', parentId: 'endometriosis'},
  {id: 'endometriosis-birth-control', name: 'Birth control fails to help with pain (or doctors repeatedly prescribing various birth control methods after others fail)', parentId: 'endometriosis'},
  {id: 'endometriosis-bladder', name: 'Chronic bladder discomfort with urination', parentId: 'endometriosis'},
  {id: 'endometriosis-bloating', name: 'Severe abdominal bloating, especially during or 1-2 days before menstruation', parentId: 'endometriosis'},
  {id: 'endometriosis-brown-consistent', name: 'Consistent 1-2 days of brown bleeding at the end of menstruation', parentId: 'endometriosis'},
  {id: 'endometriosis-brown-recurrent', name: 'Recurrent tail-end brown bleeding lasting of 3 days or more', parentId: 'endometriosis'},
  {id: 'endometriosis-bruising', name: 'Easy bruising', parentId: 'endometriosis'},
  {id: 'endometriosis-constipation', name: 'Chronic constipation', parentId: 'endometriosis'},
  {id: 'endometriosis-cramping', name: 'Severe cramping', parentId: 'endometriosis'},
  {id: 'endometriosis-family', name: 'Family history of endometriosis', parentId: 'endometriosis'},
  {id: 'endometriosis-fatigue', name: 'Fatigue', parentId: 'endometriosis'},
  {id: 'endometriosis-fetal-position', name: 'Need to curl into the fetal position during painful episodes', parentId: 'endometriosis'},
  {id: 'endometriosis-heating-pad', name: 'Using a heating pad provides pain relief', parentId: 'endometriosis'},
  {id: 'endometriosis-ibs', name: 'Symptoms or diagnosis of IBS (Irritable Bowel Syndrome)', parentId: 'endometriosis'},
  {id: 'endometriosis-ic', name: 'Symptoms or diagnosis of IC (Interstitial Cystitis)', parentId: 'endometriosis'},
  {id: 'endometriosis-infertility-asymptomatic', name: 'Infertility without any other symptoms', parentId: 'endometriosis'},
  {id: 'endometriosis-infertility-painful', name: 'Infertility with history of painful periods starting at first period', parentId: 'endometriosis'},
  {id: 'endometriosis-infertility-unexplained', name: 'Infertility (especially "unexplained") accompanied by any of the above symptoms', parentId: 'endometriosis'},
  {id: 'endometriosis-iron', name: 'Heavy menstrual bleeding and even iron deficiency', parentId: 'endometriosis'},
  {id: 'endometriosis-luf', name: 'Diagnosis of LUF (Luteinized Unruptured Follicle) syndrome', parentId: 'endometriosis'},
  {id: 'endometriosis-migraines', name: 'Migraines', parentId: 'endometriosis'},
  {id: 'endometriosis-mucus', name: 'Low quality or quantity of cervical mucus', parentId: 'endometriosis'},
  {id: 'endometriosis-nickel', name: 'Nickel sensitivity', parentId: 'endometriosis'},
  {id: 'endometriosis-otc', name: 'Over-the-counter medications fail to provide relief (or reliance on very high doses of OTC medications)', parentId: 'endometriosis'},
  {id: 'endometriosis-pain-abdominal', name: 'Raw feeling, stabbing, or achy lower abdominal pain with menstruation', parentId: 'endometriosis'},
  {id: 'endometriosis-pain-back', name: 'Pain radiating to back or down the legs during menstruation', parentId: 'endometriosis'},
  {id: 'endometriosis-pain-er', name: 'ER visits for pain related to menstruation', parentId: 'endometriosis'},
  {id: 'endometriosis-pain-menses', name: 'Menses pain interferes with daily activities', parentId: 'endometriosis'},
  {id: 'endometriosis-pain-rectal', name: 'Stabbing rectal pain', parentId: 'endometriosis'},
  {id: 'endometriosis-pain-severe', name: 'Severe pain (e.g. 8 or higher out of 10) during the first day or a couple of days leading up to menstruation', parentId: 'endometriosis'},
  {id: 'endometriosis-pain-sex', name: 'Pain during sex, related to deep penetration, or debilitating pain afterward', parentId: 'endometriosis'},
  {id: 'endometriosis-pms', name: 'Severe PMS', parentId: 'endometriosis'},
  {id: 'endometriosis-short-luteal', name: 'Short menstrual cycles (due to short luteal phases)', parentId: 'endometriosis'},
  {id: 'endometriosis-skin', name: 'Skin reactions or sensitivities', parentId: 'endometriosis'},
  {id: 'endometriosis-subtotal-tier1', name: 'Number of Tier 1 symptoms check-marked', parentId: 'endometriosis'},
  {id: 'endometriosis-subtotal-tier2', name: 'Number of Tier 2 symptoms check-marked', parentId: 'endometriosis'},
  {id: 'endometriosis-subtotal-tier3', name: 'Number of Tier 3 symptoms check-marked', parentId: 'endometriosis'},
  {id: 'endometriosis-total', name: 'Endometriosis Suspicion Score', parentId: 'endometriosis'},
  {id: 'endometriosis-urination', name: 'Chronic frequent urination', parentId: 'endometriosis'},
  {id: 'endometriosis-vomiting', name: 'Vomiting with menstruation', parentId: 'endometriosis'},
  // body
  {id: 'body', name: 'Body'},
  {id: 'body-height', name: 'Body Height', parentId: 'body'},
  {id: 'body-weight', name: 'Body Weight', parentId: 'body'},
  // vulva
  {id: 'body-vulva', name: 'Vulva', parentId: 'body'},
  {id: 'body-vulva-wetness', name: 'Vulva Wetness', parentId: 'body-vulva'},
  {id: 'body-vulva-wetness-feeling', name: 'Vulva Wetness Feeling', parentId: 'body-vulva-wetness'},
  {id: 'body-vulva-mucus', name: 'Vulva Mucus', parentId: 'body-vulva'},
  {id: 'body-vulva-mucus-inspect', name: 'Vulva Mucus Inspect', parentId: 'body-vulva-mucus'},
  {id: 'body-vulva-mucus-stretch', name: 'Vulva Mucus Stretch', parentId: 'body-vulva-mucus'}
];

const patientBasePermissionsX = [
  {id: 'profile', name: 'Profile'},
  {id: 'family', name: 'Family'},
  {id: 'fertility', name: 'Fertility'},
  {id: 'body-height', name: 'Body height'},
  {id: 'body-weight', name: 'Body weight'},
];

const patientBasePermissionsB = [
  {id: 'profile', name: 'Profile'},
  {id: 'fertility-cycles', name: 'Fertility Cycles'},
  {id: 'body-vulva', name: 'Vulva'},
  {id: 'body-weight', name: 'Body weight'},
]

const patientEndoPermissions = [
  {id: 'profile', name: 'Profile'},
  {id: 'endometriosis', name: 'Endometriosis'},
];

const formProfileContentBase = [
  {
    streamId: 'profile-name',
    eventType: 'contact/name',
    type: 'text',
    label: 'First Name',
  },
  {
    streamId: 'profile-name',
    eventType: 'contact/surname',
    type: 'text',
    label: 'Last Name',
  },
  {
    streamId: 'profile-date-of-birth',
    eventType: 'date/iso-8601',
    type: 'date',
    label: 'Date of Birth',
  }];

const formProfileContentX = [
  ...formProfileContentBase,
  {
    streamId: 'profile-address',
    eventType: 'contact/country',
    type: 'text',
    label: 'Country',
  },
  {
    streamId: 'profile-sex',
    eventType: 'attributes/biological-sex',
    type: 'select',
    options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female'}],
    label: 'Sex',
  },
  {
    streamId: 'family-children',
    eventType: 'count/generic',
    type: 'number',
    label: '# of children',
  },
  {
    streamId: 'fertility-miscarriages',
    eventType: 'count/generic',
    type: 'number',
    label: '# of miscarriages',
  },
  {
    streamId: 'fertility-cycles-charted-estimation',
    eventType: 'count/generic',
    type: 'number',
    label: '# of charted cycles',
  }
];

const formEndometriosisSurvey = [
  ...formProfileContentBase,
  {
    section: 1,
    type: 'section',
    label: 'Tier 1: Very High Suspicion'
  },
  {
    streamId: 'endometriosis-vomiting',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Vomiting with menstruation',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-brown-recurrent',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Recurrent tail-end brown bleeding lasting of 3 days or more',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-pain-er',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'ER visits for pain related to menstruation',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-pain-sex',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Pain during sex, related to deep penetration, or debilitating pain afterward',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-pain-severe',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Severe pain (e.g. 8 or higher out of 10) during the first day or a couple of days leading up to menstruation',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-pain-menses',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Menses pain interferes with daily activities',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-pain-rectal',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Stabbing rectal pain',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-pain-back',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Pain radiating to back or down the legs during menstruation',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-pain-abdominal',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Raw feeling, stabbing, or achy lower abdominal pain with menstruation',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-heating-pad',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Using a heating pad provides pain relief',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-fetal-position',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Need to curl into the fetal position during painful episodes',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-cramping',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Severe cramping',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-birth-control',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Birth control fails to help with pain (or doctors repeatedly prescribing various birth control methods after others fail)',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-otc',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Over-the-counter medications fail to provide relief (or reliance on very high doses of OTC medications)',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-infertility-unexplained',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Infertility (especially "unexplained") accompanied by any of the above symptoms',
    section: 1,
    multiplier: 3
  },
  {
    streamId: 'endometriosis-subtotal-tier1',
    eventType: 'count/generic',
    type: 'total',
    label: 'Number of Tier 1 symptoms check-marked',
    section: 1
  },
  {
    section: 2,
    type: 'section',
    label: 'Tier 2: High Suspicion'
  },
  {
    streamId: 'endometriosis-bladder',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Chronic bladder discomfort with urination',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-urination',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Chronic frequent urination',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-iron',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Heavy menstrual bleeding and even iron deficiency',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-infertility-asymptomatic',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Infertility without any other symptoms',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-infertility-painful',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Infertility with history of painful periods starting at first period',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-mucus',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Low quality or quantity of cervical mucus',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-ibs',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Symptoms or diagnosis of IBS (Irritable Bowel Syndrome)',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-ic',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Symptoms or diagnosis of IC (Interstitial Cystitis)',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-bloating',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Severe abdominal bloating, especially during or 1-2 days before menstruation',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-migraines',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Migraines',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-short-luteal',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Short menstrual cycles (due to short luteal phases)',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-pms',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Severe PMS',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-constipation',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Chronic constipation',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-brown-consistent',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Consistent 1-2 days of brown bleeding at the end of menstruation',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-luf',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Diagnosis of LUF (Luteinized Unruptured Follicle) syndrome',
    section: 2,
    multiplier: 2
  },
  {
    streamId: 'endometriosis-subtotal-tier2',
    eventType: 'count/generic',
    type: 'total',
    label: 'Number of Tier 2 symptoms check-marked',
    section: 2,
  },
  {
    section: 3,
    type: 'section',
    label: 'Tier 3: Suspicion'
  },
  {
    streamId: 'endometriosis-fatigue',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Fatigue',
    section: 3,
    multiplier: 1
  },
  {
    streamId: 'endometriosis-nickel',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Nickel sensitivity',
    section: 3,
    multiplier: 1
  },
  {
    streamId: 'endometriosis-skin',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Skin reactions or sensitivities',
    section: 3,
    multiplier: 1
  },
  {
    streamId: 'endometriosis-bruising',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Easy bruising',
    section: 3,
    multiplier: 1
  },
  {
    streamId: 'endometriosis-family',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Family history of endometriosis',
    section: 3,
    multiplier: 1
  },
  {
    streamId: 'endometriosis-autoimmune',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Personal history of autoimmune conditions',
    section: 3,
    multiplier: 1
  },
  {
    streamId: 'endometriosis-subtotal-tier3',
    eventType: 'count/generic',
    type: 'total',
    label: 'Number of Tier 3 symptoms check-marked',
    section: 3
  },
  {
    streamId: 'endometriosis-total',
    eventType: 'count/generic',
    type: 'total',
    label: 'Endometriosis Suspicion Score'
  }
]

const formHistoricalContentX = [
  {
    streamId: 'fertility-ttc-tta',
    eventType: 'fertility-intention/ttc-tta',
    label: 'Goal: Trying to conceive or avoid pregnancy',
    type: 'select',
    parseValueToNum: true,
    options: [
      {
        value: 0,
        label: 'TTA - Not taking risks. Would take all available measures to end a pregnancy.'
      },
      {
        value: 1,
        label: 'TTA - Not taking risks. Would strongly consider placing baby for adoption.'
      },
      {
        value: 2,
        label: 'TTA - Not taking risks. Would need some time, maybe counseling. Ultimately keeping the pregnancy.'
      },
      {
        value: 4,
        label: 'TTA - Not taking risks. Currently content with family size but a surprise pregnancy would be welcome.'
      },
      {
        value: 5,
        label: 'TTW/TTA - “Loosely TTA” known risks are taken in the fertile window. “OOPS” pregnancy would be welcome.'
      },
      {
        value: 6,
        label: 'TTW - Charting only for health/curiosity. Unprotected intercourse happens whenever. Pregnancy very welcome.'
      },
      {
        value: 7,
        label: 'TTW/TTC - Pregnancy very welcome (moving up the scale in very near future).'
      },
      {
        value: 8,
        label: 'TTC - “Excited to start/grow a family TTC” Intentional intercourse every cycle. Excited to start/grow a family. But would not use any fertility treatments if needed.'
      },
      {
        value: 9,
        label: 'TTC - “Highly hopeful TTC” Intentional intercourse every cycle. Would consider some but not all fertility treatments if needed.'
      },
      {
        value: 10,
        label: 'TTC - “Seriously TTC” Intentional intercourse every cycle. Would pursue any/ALL fertility treatments or procedures if needed.'
      }
    ]
  },
  {
    streamId: 'body-weight',
    eventType: 'mass/kg',
    type: 'number',
    label: 'Body Weight (kg)',
  }
]

const formHistoricalContentB = [
  {
    streamId: 'body-weight',
    eventType: 'mass/kg',
    type: 'number',
    label: 'Body Weight (kg)',
  },
  {
    label: 'Vulva Wetness feeling',
    streamId: 'body-vulva-wetness-feeling',
    eventType: 'ratio/generic',
    type: 'select',
    options: [
      { value: 0, label: 'Dry' },
      { value: 1, label: 'Wet' },
      { value: 2, label: 'Very wet'}
    ]
  },
  {
    streamId: 'body-vulva-mucus-inspect',
    eventType: 'vulva-mucus-inspect/v0',
    type: 'select',
    label: 'Cervical Fluid Inspect',
    options: [
      { value: 'clear', label: 'Clear' },
      { value: 'creamy', label: 'Creamy' },
      { value: 'dry-sticky', label: 'Dry & Sticky' },
      { value: 'egg-white', label: 'Egg White' },
    ]
  },
  {
    streamId: 'body-vulva-mucus-stretch',
    eventType: 'ratio/generic',
    type: 'select',
    label: 'Cervical Fluid Stretch',
    options: [
      { value: 0, label: 'No Strech' },
      { value: 1, label: 'Short' },
      { value: 2, label: 'Long'}
    ]
  },
  {
    streamId: 'fertility-cycles-start',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'New Cycle'
  },
  {
    streamId: 'fertility-cycles-ovulation',
    eventType: 'activity/plain',
    type: 'checkbox',
    label: 'Ovulation Day'
  }
]


const questionnaires = {
  'questionary-x': {
    title: 'Demo with Profile and TTC-TTA',
    permissions: patientBasePermissionsX.map(perm => ({
      streamId: perm.id,
      level: 'read',
      name: perm.name,
    })),
    patientBaseStreams,
    forms: {
      profile: {
        type: 'permanent',
        key: 'profile-x',
        name: 'Profile',
        content: formProfileContentX
      },
      history: {
        type: 'recurring',
        key: 'recurring-x',
        name: 'History',
        content: formHistoricalContentX
      }
    }
  },
  'questionnary-basic': {
    title: 'Basic Profile and Cycle Information',
    permissions: patientBasePermissionsB.map(perm => ({
      streamId: perm.id,
      level: 'read',
      name: perm.name,
    })),
    patientBaseStreams,
    forms: {
      profile: {
        type: 'permanent',
        key: 'profile-b',
        name: 'Profile',
        content: formProfileContentBase
      },
      history: {
        type: 'recurring',
        key: 'recurring-b',
        name: 'History',
        content: formHistoricalContentB
      }
    }
  },
  'questionnary-endometriosis': {
    title: '3 Tier Endometriosis Symptom Self-Survey',
    permissions: patientEndoPermissions.map(perm => ({
      streamId: perm.id,
      level: 'read',
      name: perm.name,
    })),
    patientBaseStreams,
    forms: {
      profile: {
        type: 'permanent',
        key: 'profile-endo',
        name: 'Profile',
        content: formEndometriosisSurvey
      }
    }
  }
}

export const dataDefs = {
  appId: 'demo-dr-forms',
  questionnaires,
};