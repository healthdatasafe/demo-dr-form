
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
  {id: 'fertility-ttc-tta', name: 'Trying to conceive / Avoiding pregnancy', parentId: 'fertility'},
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
  }
}

const v2 = {
  'questionary-x': {
    title: 'Demo with Profile and TTC-TTA',
    forms: {
      profile: {
        type: 'permanent',
        key: 'profile-x',
        name: 'Profile',
        itemKeys: [
          'profile-contact-name',
          'profile-sex',
          'family-children-count',
          'fertility-miscarriages-count'
        ]
      },
      history: {
        type: 'recurring',
        key: 'recurring-x',
        name: 'History',
        itemKeys: [
          'fertility-ttc-tta',
          'body-weight'
        ]
      }
    }
  }
}

export const dataDefs = {
  appId: 'demo-dr-forms',
  questionnaires,
  v2questionnaires: v2
};