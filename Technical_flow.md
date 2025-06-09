First version

## Doctor Account

A doctor has an HDS account to:

1. Collect the authorization to access data by patients.
2. Define forms (will be done in a later step)
   - The forms content should be encoded in JSON providing the necessary information for the patient web application to give information on the data collected and provided by the patient.
   - In the first demo release, the form will be hard-coded in the app.

```
Streams structure of a doctor account
- patients
	- patients-inbox: where new patients are posting
		their credentials to access the data.
		For the demo this may be sufficient
	- patients-validated: contains validated patient
		(credentials are moved from Inbox in this stream)
- Forms
	- Questionnaire A
	- Questionnaire B
	- Questionnaire ...
```

### Patient Accounts

They contains personal data with the following streams

(emails are already used for registration)

```
- profile
	- profile-name: First name / Last name
		- event of type "contact/name-surname" & "contact/maiden-name" or "contact/vcard"
	- profile-address: - event of type "contact/country"
	- profile-date-of-birth: - event of type "date/iso-8601"
	- profile-location: - event of type (to be discussed) "contact/vcard" or "location/city"
	- profile-sex: - event of type "attributes/biological-sex"
- family
	- family-children: events of type "count/generic"
- fertility
	- fertility-miscarriages: events of type "count/generic"
	- awarness-training: events of type "training/fabm-v1"
			Event or streams content to be defined (see below)
	- fertitity-cycles
		- fertitity-cycles-charted-estimation: "generic/count"
  - ttc-tta: "fertility-intention/ttc-tta" (see below)
- body
	- body-height: - event of type "length/*" meters or ...
	- body-weigth: - event of type "mass/*" kg or ...
- demo-dr-form: (stream to track states and usage of this app)
	- inbox
	- accepted
	- rejected
```

##### Tracking fertility awareness contents

Here we have the possibility to create either 1 specific event type containing a string with the method or a stream per method and add more information afterwards. As this is a prototype, we'll have to discuss what's the easiest implementation considering the frontend perspective.

##### Tracking fertility intention

Create an event type of `fertility-intention/ttc-tta` based on https://fertilityawarenessmethodofbirthcontrol.com/fertility-intentions-scale/


### Technical flow

#### **Requirements** 

For each form, an `apiEndpoint` is created up-front with the following credentials

*For the demo, this will be hand made; in the future, this will be created from the doctor's frontend*

```
[
	{streamId: "patients-inbox", level: "create-only"},
	{streamId: "questionnary-x", level: "read"}
]
```

This will allow the patient's app to publish its authorization to the doctor's account.

##### Patient web app flow

The link to the patient web app contains in its query the doctor's apiEndpoint.

1- The web app queries HDS to figure out which questionnaire to display (hardcoded in the 1st version)

2- The web app presents the description of HDS, the recipient of the form (the doctor), and prompts to either register or login in

3- After log-in the app receives an API endpoint

- The app checks the state of this form with the latest event in the `demo-dr-form` stream event-type `demo-dr-form-state/questionnary-x`
- If this is the first time the user logs in with this form, the web app creates a `sharing` api-endpoint for the doctor and publishes it in his `inbox` stream

4- The form is presented to the patient with "pre-filled" data from any existing info.
