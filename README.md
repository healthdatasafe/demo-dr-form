# demo-dr-form
Demonstrator for doctor-requested data with a form

## Context

A doctor sends a link to a patient.

From this link the patient:

- Sees a short presentation of HDS including a link to the HDS web site for more details.
- Can register for HDS or sign in

When signed in the patient sees a form to complete. If the patient is returning to the form he can update existing data.

- As an opt-in the patient can allow HDS to access non-medical data in order to present HDS concepts and capabilities during patient webinars.

The patient also has a page to see who has or had access to his data.

The doctor has a page where he can see individuals' data and aggregated data and export it.

## Logic drafting

Based on [Pryv.io](https://api.pryv.com)

- Doctor has an HDS "controlling account" where the credentials to access patients' data will be kept 
- The link sent to a patient contains the necessary credentials to:
  - Get the list of specific questions (for the doctor)
  - Allow patients to post credentials to access their data

### Inspiration

**2 demo apps**
1- [Collect web app](https://pryv.github.io/example-apps-web/collect-survey-data/?pryvServiceInfoUrl=https://demo.datasafe.dev/reg/service/info) to login / register and collect data
2- [View and share web app](https://pryv.github.io/example-apps-web/view-and-share/index.html?pryvServiceInfoUrl=https://demo.datasafe.dev/reg/service/info) to view the data and create a share link

Base concepts are present, but the flow needs to be adapted

## Contents

### Overview of HDS

Health Data Safe is a non-profit initiative aimed at protecting and enhancing health data, starting with that of women using cycle observation methods (COMs, also known as FABM or NFP). This tool will give users complete control over the use of their data for the sole purpose of improving their personal health or for medical research validated by an ethical committee. Beneficiaries of this solution will be able to control access to their data and their participation in specific research projects at any time. The data portal will be fully compatible with existing solutions, enabling participating organizations to use it easily and securely. With this tool, partners (caregivers, companions, etc.) rooted in a Hippocratic vision of medicine will be able to considerably accelerate medical research into the female cycle, and make innovative solutions to improve women's health and knowledge of the female cycle available to all.

### Questions list 

    * First Name *
    * Last Name *
    * Maiden name
    * Country
    * Date of birth *
    * City
    * Sex
    * Email *
    * Height
    * Weight
    * Number of children born
    * Number of miscarriages
    * Trained in FABM/NFP yes/no/precise

Creighton (CrM)

Justisse

Billings

FEMM

Other cervical fluid only method: precise

Sensiplan

Neo Fertility

Cervical fluid associated with the Natural Cycles° App

Other Symptothermal method: precise 

Marquette 

Boston Cross Check

Other Cervical Fluid + Hormonal Test Methods: precise

Other Calendar Based Methods

Other: precise 

* Estimated number of feminine cycles charted so far 
* TTC / TTA scale : https://fertilityawarenessmethodofbirthcontrol.com/fertility-intentions-scale/ 
