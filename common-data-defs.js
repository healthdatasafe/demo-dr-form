const patientBaseStreams = [
  // profile
  {id: 'profile-name', name: 'Name', parentId: 'profile'},
  {id: 'profile-nationality', name: 'Nationality', parentId: 'profile'},
  {id: 'profile-date-of-birth', name: 'Date of Birth', parentId: 'profile'},
  {id: 'profile-location', name: 'Location', parentId: 'profile'},
  {id: 'profile-sex', name: 'Sex', parentId: 'profile'},
  // family
  {id: 'family-children', name: 'Children', parentId: 'family'},
  // fertility
  {id: 'fertility-miscarriages', name: 'Miscarriages', parentId: 'fertility'},
  {id: 'fertility-traings', name: 'Trainings', parentId: 'fertility'},
  {id: 'fertility-cycles', name: 'Cycles', parentId: 'fertility'},
  {id: 'fertility-cycles-charted-extimation', name: 'Cycles charted estimation', parentId: 'fertility'},
  {id: 'fertility-ttc-tta', name: 'Trying to conceive / Avoiding pregnancy', parentId: 'fertility'},
];

const patientBasePermissions = [
  {id: 'profile', name: 'Profile'},
  {id: 'family', name: 'Family'},
  {id: 'fertility', name: 'Fertility'},
  {id: 'body-height', name: 'Body height'},
  {id: 'body-weight', name: 'Body weight'},
]

const formContent = [
  {
    streamId: 'profile-name',
    eventType: 'contact/name',
    type: 'text',
    label: 'Name',
    dataFieldKey: 'name',
  },
  {
    streamId: 'profile-name',
    eventType: 'contact/surname',
    type: 'text',
    label: 'Surname',
    dataFieldKey: 'surname',
  },
  {
    streamId: 'profile-nationality',
    eventType: 'contact/nationality',
    type: 'text',
    label: 'Nationality',
    dataFieldKey: 'nationality',
  },
  {
    streamId: 'family-children',
    eventType: 'count/generic',
    type: 'number',
    label: 'Nb of children',
    dataFieldKey: 'children-count',
  },
  {
    streamId: 'fertility-miscarriages',
    eventType: 'count/generic',
    type: 'number',
    label: 'Nb of miscarriages',
    dataFieldKey: 'miscarriages-count',
  },
  {
    streamId: 'fertility-cycles-charted-extimation',
    eventType: 'count/generic',
    type: 'number',
    label: 'Nb of charted cycles',
    dataFieldKey: 'charted-cycles-count',
  }
];

const dataDefs = {
  patientBaseStreams,
  patientBasePermissions,
  formContent
};