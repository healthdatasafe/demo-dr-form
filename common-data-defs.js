

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


const questionnaires = {
  'questionary-x': {
    title: 'Demo with Profile and TTC-TTA',
    permissions: patientBasePermissionsX.map(perm => ({
      streamId: perm.id,
      level: 'read',
      name: perm.name,
    })),
    forms: {
      profile: {
        type: 'permanent',
        key: 'profile-x',
        name: 'Profile',
      },
      history: {
        type: 'recurring',
        key: 'recurring-x',
        name: 'History',
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
    forms: {
      profile: {
        type: 'permanent',
        key: 'profile-b',
        name: 'Profile'
      },
      history: {
        type: 'recurring',
        key: 'recurring-b',
        name: 'History'
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
          'profile-name',
          'profile-surname',
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
  },
  'questionnary-basic': {
    title: 'Basic Profile and Cycle Information',
    forms: {
      profile: {
        type: 'permanent',
        key: 'profile-b',
        name: 'Profile',
        itemKeys: [
          'profile-name',
          'profile-surname',
          'profile-date-of-birth'
        ]
      },
      history: {
        type: 'recurring',
        key: 'recurring-b',
        name: 'History',
        itemKeys: [
          'body-weight',
          'body-vulva-wetness-feeling',
          'body-vulva-mucus-inspect',
          'body-vulva-mucus-stretch',
          'fertility-cycles-start',
          'fertility-cycles-ovulation'
        ]
      }
    }
  }
}

/**
 * get all itemKeys of a questionnary
 * @param {*} questionaryId 
 */
function utilGetAllItemKeys (questionaryId) {
  const questionary = v2[questionaryId];
  const itemKeys = [];
  for (const formContent of Object.values(questionary.forms)) {
    itemKeys.push(...formContent.itemKeys);
  }
  return itemKeys;
}

export const dataDefs = {
  appId: 'demo-dr-forms',
  questionnaires,
  v2questionnaires: v2,
  utilGetAllItemKeys
};