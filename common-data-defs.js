
const v2 = {
  'questionary-x': {
    title: 'Demo with Profile and TTC-TTA 6',
    permissionsPreRequest: [
      {streamId: 'profile'},
      {streamId: 'fertility'},
    ],
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
        ],
        customItems: {
          'test-1': {
            label: 'This is a checkbox',
            type: 'checkbox',
          },
          'test-2': {
            label: 'This is a multiple choice',
            type: 'multiple',
            options: [
              { value: 'anemia', label: 'Anemia' }
            ]
          },
          'test-3': {
            label: 'This is question',
            type: 'text'
          }
        }
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
    title: 'Basic Profile and Cycle Information 3',
    permissionsPreRequest: [
      {streamId: 'profile'}
    ],
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
  },
  'questionnary-with-chat-3': {
    features: { chat: { type: 'user' } },
    forms: {
      history: {
        itemKeys: [
          'body-weight',
          'fertility-cycles-start',
          'fertility-cycles-ovulation',
          'fertility-cycles-period-end',
          'fertility-cycles-fertile-window',
          'fertility-hormone-lh',
          'fertility-hormone-fsh'
          ],
        key: 'recurring-c',
        name: 'History',
        type: 'recurring'
      },
      profile: {
        itemKeys: ['profile-date-of-birth'],
        key: 'profile-c',
        name: 'Profile',
        type: 'permanent'
      }
    },
    permissionsPreRequest: [{ streamId: 'profile' }],
    title: 'Basic with chat 3'
  }
}

export const dataDefs = {
  v2questionnaires: v2,
};