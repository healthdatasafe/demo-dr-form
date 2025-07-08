
import { hdsModel } from './common-lib.js';
const v2 = {
  'questionary-x': {
    title: 'Demo with Profile and TTC-TTA 3',
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
  }
}


function utilGetPermissions (questionaryId) {
  const preRequest = v2[questionaryId].permissionsPreRequest || [];
  const itemKeys = utilGetAllItemKeys(questionaryId);
  const permissions = hdsModel().authorizations.forItemKeys(itemKeys, { preRequest });
  return permissions
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
  v2questionnaires: v2,
  utilGetAllItemKeys,
  utilGetPermissions
};