First version 

## Dr Account

Dr has an HDS account to 

1. Collect the authorization to access data by patients.
2. Define forms (will be done in a second steps)
   - The forms content should be encoded in JSON providing the necessary information for the WebApplication for patient give information on the data collected and provide from to the patient.
   - In the First demo release, the form will be hard-coded in the App.

```
Streams structure of a Dr Account
- patients
	- patients-inbox: where new patients are posting 
		their credentials to access the data. 
		For the demo this may be sufficient
	- patients-validated: contains validated patient 
		(credentials are moved from Inbox in this stream)
- Forms
	- Questionnary A
	- Questionnary B
	- Questionnary ...

```

### Patient accounts

They contains personal data with the following streams

(emails are already used for registration)

```
- profile
	- profile-name: Name / Surname 
		- event of type "contact/name-surname" & "contact/maiden-name" or "contact/vcard"
	- profile-nationality: - event of type "contact/nationality"
	- profile-date-of-birth: - event of type "date/iso-8601"
	- profile-location: - event of type (to be discussed) "contact/vcard" or "location/city"
	- profile-sex: - event of type "attributes/biological-sex"
- familly
	- familly-children: events of type "count/generic"
- fertility
	- fertility-miscarriages: events of type "count/generic"
	- awarness-training: events of type "training/fabm-v1"
			Event or streams content to be defined (see bellow)
	- fertitity-cycles
		- fertitity-cycles-charted-estimation: "generic/count"
  - ttc-tta: "fertility-intention/ttc-tta" (see bellow)
- body
	- body-height: -event of type "length/*" meters or ...
	- body-weigth: -event of type "mass/*" kg or ...
- demo-dr-form: (stream to track states and usage of this app)
```

##### Tracking fertility awareness contents

Here we have the possibilty to create either 1 specific event type containing a string with the method or a stream per method and add more information afterwards. As this is a prototype, we'll have to discuss what's the easiest implementation considering Front-end perspective. 

##### Tracking fertility intention

Create an event type of `fertility-intention/ttc-tta`  based on https://fertilityawarenessmethodofbirthcontrol.com/fertility-intentions-scale/



### Technical flow

#### **Requirements** 

For each form, an `apiEndpoint` is created upfront with the following credentials
*For the demo, this will be hand made, in the future, this will be created from Dr's FrontEnd*

``` 
[
	{streamId: "patients-inbox", level: "create-only"},
	{streamId: "questionnary-x", level: "read"}
]
```

This will allow the Patient's app to publish it's authorization to the Dr's Account 

##### Flow Patient Web App

The link to the patient webApp contains in its query the Dr's apiEndpoint

1- The WebApp query HDS to figure out which questionnary to display (hardcode 1st version)

2- The WebApp present the description of HDS, the recipient of the form (the Dr) and propose to register or login in

3- After Log-In the App recieves and API endpoint 

- The app check the state of this form with the latest event in `demo-dr-form` stream event-type `demo-dr-form-state/questionnary-x`
- If this is the first time the use logs-in with this form the WebApp creates  and `sharing` api-endpoint for the Dr and publish it in his `inbox`  stream

4- The form is presented to the patient with "pre-filled" data from eventual existing info.