# demo-dr-form
Demonstrator for Dr requested data with Form

## Context

A doctor sends a link to a patient. 

From this link the patient 

- Sees a short presentation of HDS including a link to HDS web site for more details. 
- Can register to HDS or Sign-in 

When signed in the patient sees a from to complete. If the patient is returning to the form he can update exsiting data.

- As an opt-in the patient can allow HDS to access non medical data in order to present HDS concept and capabilities during patient webinars.

The patient also has a page to see who has or had access to his data. 

The doctor has a page where he can see individual's data and aggregated data and export it

## Logic drafting 

Based on [Pryv.io](https://api.pryv.com)  

- Dr has an HDS "controlling account" where the credentials to access to patient's data will be kept 
- The link sent to patient contains the necessary credentials to 
  - Get the list of specific questions (for the doctor)
  - Allow patients to post credentials to access their data 

### Inspiration

**2 demo apps**
1- [Collect web app](https://pryv.github.io/example-apps-web/collect-survey-data/?pryvServiceInfoUrl=https://demo.datasafe.dev/reg/service/info) to login / register and collect data
2- [View and share web app](https://pryv.github.io/example-apps-web/view-and-share/index.html?pryvServiceInfoUrl=https://demo.datasafe.dev/reg/service/info) to view the data and create a share link 
Base concepts are present, but the flow needs to be adapted

## Contents

### Text to be translated in English to present HDS

Le Health Data Safe est une initiative à but non lucratif visant la protection et la valorisation des données de santé, à commencer par celles des femmes utilisant les méthodes d’observation du cycle (MOC). Cet outil permettra aux utilisatrices et utilisateurs un contrôle complet de l’utilisation de leurs données aux seules fins de l’amélioration de leur santé personnelle ou de recherches médicales validées par un Comité éthique. Les bénéficiaires de cette solution pourront contrôler à tout moment l'accès à leurs données et leur participation à telle ou telle recherche. Ce portail de données sera pleinement compatible avec les solutions déjà en place et permettra une utilisation aisée et sécurisée des organisations participantes. Avec cet outil, les partenaires (soignants, accompagnateurs) ancrés dans une vision hippocratique de la médecine pourront considérablement accélérer la recherche médicale sur le cycle féminin et mettre à disposition de toutes et tous des solutions innovantes pour améliorer la santé féminine et la connaissance du cycle féminin.

### Questions list 

    * First Name *
    * Last Name *
    * Maid name 
    * Country
    * Date of birth  *
    * City
    * Sexe
    * Email *
    * Height
    * Weight 
    * Number of born children
    * Number of miscarriages 
    * Trained in FABM/NFP yes/no/precise

Creighton (CrM)

Justisse

Billings

FEMM

Other cervical fluid only method : precise

Sensiplan

Neo Fertility

Cervical fluid associated with the Natural Cycles° App

Other Symptothermal method : precise 

Marquette 

Boston Cross Check

Other Cervical Fluid + Hormonal Test Methods, precise

Other Calendar Based Methods

Other : precise 

* Estimated number of feminine cycle charted so far 
* TTC / TTA scale : https://fertilityawarenessmethodofbirthcontrol.com/fertility-intentions-scale/ 



