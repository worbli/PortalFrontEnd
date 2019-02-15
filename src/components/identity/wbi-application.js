import {createMixin} from 'polymer-redux';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import store from '../../global/store.js';
import '../../css/shared-styles.js';
import '../../components/camsnap/wbi-camsnap.js';

const ReduxMixin = createMixin(store);
class WbiApplication extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
      <style include='shared-styles'>
        :host {
          display: box;
          background-color: var(--header-background-color);
          box-shadow: inset 0 1px 0 var(--header-background-color), 0 1px 0px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.05);
          z-index: 8888;
        }
        label {
          display: block;
        }
        .radio_group label{
          display: inline;
        }
        .inner-fraame{
          background-color: #CCC;
          padding: 48px;
          margin: 24px 0;
        }

      </style>
      <div>
        <label for='Country'>Select Country</label>
        <select value='{{country::input}}' on-change="_makeRadioButtons">
          <option value='' id=''>Select...</option>
          <template is='dom-repeat' items='[[countrydocs]]'>
            <option value='{{item.code}}' id='{{item.code}}'>{{item.name}}</option>
          </template>
        </select>        
        </hr>
        <h2>Personal information</h2>

        <label for='firstName'>First Name</label>
        <input type='text' name='firstName' id='firstName' value='{{firstName::input}}'><br>

        <label for='lastName'>Last Name</label>
        <input type='text' name='lastName' id='lastName' value='{{lastName::input}}'><br>

        <label for='dob'>Date of birth</label>
        <select name='day' id='day' value='{{day::input}}'>
          <option value='Day'>Day</option>
          <option value='1'>1</option>
          <option value='2'>2</option>
          <option value='3'>3</option>
        </select>
        <select name='month' id='month' value='{{month::input}}'>
          <option value='Month'>Month</option>
          <option value='1'>January</option>
          <option value='2'>Febuary</option>
          <option value='3'>March</option>
        </select>
        <select name='year' id='year' value='{{year::input}}'>
          <option value='Year'>Year</option>
          <option value='2000'>2000</option>
          <option value='1999'>1999</option>
          <option value='1998'>1998</option>
        </select><br>


        <label for='gender'>Gender</label>
        <input type='text' name='gender' id='gender' value='{{gender::input}}'><br>
        
        <template is="dom-if" if="{{radioArray}}">
        <div class='inner-fraame'>
        
          <h1>Upload documents</h1>
          <p>Information for ensuring only you</p>

          <!-- <button type='button'>Use your mobile</button> -->
          
            <p class='radio_group'>
              <label>ID Type</label><br>
              <template is='dom-repeat' items='[[radioArray]]'>         
                <input type='radio' name='document' id='[[item.value]]' on-click='_makeFileUpload'/>
                <label for='sizeSmall'>[[item.label]]</label>
              </template>
              {{radio}}
            </p> 
            

          <!-- <button type='button'>Enable camera and take a picture</button>
          <p>or just upload file from your device</p> -->
          <template is="dom-if" if="{{fileArray}}">
            <template is='dom-repeat' items='[[fileArray]]'>
              <label for='[[item.value]]'>Upload [[item.label]]</label>
              <input type='file' name='file' id='[[item.value]]' on-change="_saveLocally"/></br>
            </template>
          </template>

  
          <!-- <p>Please make sure your ID</p> -->
          </hr>

          <!-- <h2>Selfie</h2> -->
          
          <!-- <wbi-camsnap></wbi-camsnap>
          <p>or just upload from your device</p> -->

          <label for='file'>Upload selfie</label>
          <input type='file' name='file' id='selfie' on-change="_saveLocally"/></br>
          <!-- <p>Make sure your selfie is clearly shows your face</p> -->
        </div>
        </template>
        <input type='submit' name='submit' value='Submit' on-click="_submit"/>
      </div>
    `;
  }

  static get properties() {
    return {
      language: {
        type: Text,
        readOnly: true,
      },
      mode: {
        type: Text,
        readOnly: true,
      },
      color: {
        type: Object,
        readOnly: true,
      },
      env: {
        type: Object,
        readOnly: true,
      },
      countrydocs: {
        type: Array,
      },
      selectDocs: {
        type: Object,
        value: '',
      },
      selectedDoc: {
        type: Object,
      },
      radioArray: {
        type: Array,
      },
      fileArray: {
        type: Array,
      },
      env: {
        type: Object,
      },
    };
  }

  static mapStateToProps(state, element) {
    return {
      language: state.language,
      mode: state.mode,
      color: state.color,
      env: state.env,
    };
  }
  _submit() {
    console.log('Sending to API');
    console.log(`Country: ${this.country}`);
    console.log(`First Name: ${this.firstName}`);
    console.log(`Last Name: ${this.lastName}`);
    console.log(`Date of birth: ${this.day}/${this.month}/${this.year}`);
    console.log(`Gender: ${this.gender}`);
    console.log(`Document Type: ${this.selectedDoc}`);
    const selfieFile = this.shadowRoot.querySelector('#selfie').files;
    console.log(`Selfie: ${selfieFile}`);
    if (this.country && this.firstName && this.lastName && this.day && this.month && this.year) { // NOTE: only post to api if we have the data
      this._postToApi();
    } else {
      // TODO: Indicate to the user whats missing
    }
  }

  _postToApi() {
    // NOTE: this function is called rom _submit above ^^
    const selectedFiles = this.fileArray; // NOTE: the id's of file inputs are in this array, loop over and get files same as selfie below
    const selfieFile = this.shadowRoot.querySelector('#selfie').files; // check file type may need converting to blob??
    const formData = new FormData();
    formData.append('blob', new Blob([]), 'test'); // TODO: append images as blob, maybe need to set content type header along with the jwt token
    fetch(this.env.apiUrl, {
      method: 'POST',
      body: formData,
    })
        .then((r) => r.json())
        .then((data) => {
          console.log(data);
        });
  }

  _saveLocally(e) {
    if (e && e.model && e.model.__data && e.model.__data.item && e.model.__data.item.value) {
      const fileName = e.model.__data.item.value;
      console.log(fileName);
    } else {
      const fileName = this.shadowRoot.querySelector('#selfie').files;
      console.log(fileName);
    }
  }

  _makeFileUpload(e) {
    this.fileArray = [];
    this.selectedDoc = e.model.__data.item.value;
    const needReverse = this.countrydocs.find((x) => x.code === this.country).accepted[0][this.selectedDoc];
    needReverse ? this.fileArray.push({value: `${this.selectedDoc}_reverse`, label: `${this.selectedDoc.replace(/[_-]/g, ' ')} reverse`}, {value: `${this.selectedDoc}`, label: `${this.selectedDoc.replace(/[_-]/g, ' ')}`})
    : this.fileArray.push({value: `${this.selectedDoc}`, label: `${this.selectedDoc.replace(/[_-]/g, ' ')}`});
  }

  _makeRadioButtons() {
    const docsAvailable = this.countrydocs.find((x) => x.code === this.country).accepted[0];
    this.radioArray = [];
    for (let i = 0; i < Object.keys(docsAvailable).length; i++) {
      this.radioArray.push({
        label: Object.keys(docsAvailable).map((data) => data.replace(/[_-]/g, ' '))[i],
        value: Object.keys(docsAvailable)[i],
      });
    }
  }

  ready() {
    super.ready();
    this.countrydocs = [
      {'code': 'AFG', 'name': 'Afghanistan', 'accepted': [{'passport': false}]},
      {'code': 'AGO', 'name': 'Angola', 'accepted': [{'passport': false}]},
      {'code': 'ALB', 'name': 'Albania', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'AND', 'name': 'Andorra', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'ARE', 'name': 'United Arab Emirates', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'ARG', 'name': 'Argentina', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'ARM', 'name': 'Armenia', 'accepted': [{'passport': false}]},
      {'code': 'ATG', 'name': 'Antarctica', 'accepted': [{'passport': false}]},
      {'code': 'AUS', 'name': 'Australia', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'AUT', 'name': 'Austria', 'accepted': [{'national_identity_card': true}]},
      {'code': 'AZE', 'name': 'Azerbaijan', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'BDI', 'name': 'Burundi', 'accepted': [{'passport': false}]},
      {'code': 'BEL', 'name': 'Belgium', 'accepted': [{'national_identity_card': true}]},
      {'code': 'BEN', 'name': 'Benin', 'accepted': [{'passport': false}]},
      {'code': 'BFA', 'name': 'Burkina Faso', 'accepted': [{'passport': false}]},
      {'code': 'BGD', 'name': 'Bangladesh', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'BGR', 'name': 'Bulgaria', 'accepted': [{'national_identity_card': true}]},
      {'code': 'BHR', 'name': 'Bahrain', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'BHS', 'name': 'Bahamas', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'BIH', 'name': 'Bosnia and Herzegovina', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'BLR', 'name': 'Belarus', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'BLZ', 'name': 'Belize', 'accepted': [{'passport': false}]},
      {'code': 'BMU', 'name': 'Bermuda', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'BOL', 'name': 'Bolivia, Plurinational State of', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'BRA', 'name': 'Brazil', 'accepted': [{'national_identity_card': true}]},
      {'code': 'BRB', 'name': 'Barbados', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'BRN', 'name': 'Brunei Darussalam', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'BTN', 'name': 'Bhutan', 'accepted': [{'passport': false}]},
      {'code': 'BWA', 'name': 'Botswana', 'accepted': [{'passport': false}]},
      {'code': 'CAF', 'name': 'Central African Republic', 'accepted': [{'passport': false}]},
      {'code': 'CAN', 'name': 'Canada', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'CHE', 'name': 'Switzerland', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'CHL', 'name': 'Chile', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'CHN', 'name': 'China', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'CIV', 'name': 'Côte d\'Ivoire', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'CMR', 'name': 'Cameroon', 'accepted': [{'passport': false}]},
      {'code': 'COD', 'name': 'Congo, the Democratic Republic of the', 'accepted': [{'passport': false}]},
      {'code': 'COG', 'name': 'Congo', 'accepted': [{'passport': false}]},
      {'code': 'COL', 'name': 'Colombia', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'COM', 'name': 'Comoros', 'accepted': [{'passport': false}]},
      {'code': 'CPV', 'name': 'Cape Verde', 'accepted': [{'passport': false}]},
      {'code': 'CRI', 'name': 'Costa Rica', 'accepted': [{'passport': false, 'driving_license': true, 'national_identity_card': true}]},
      {'code': 'CUB', 'name': 'Cuba', 'accepted': [{'passport': false}]},
      {'code': 'CYM', 'name': 'Cayman Islands', 'accepted': [{'passport': false}]},
      {'code': 'CYP', 'name': 'Cyprus', 'accepted': [{'national_identity_card': true}]},
      {'code': 'CZE', 'name': 'Czech Republic', 'accepted': [{'national_identity_card': true}]},
      {'code': 'DEU', 'name': 'Germany', 'accepted': [{'national_identity_card': true}]},
      {'code': 'DJI', 'name': 'Djibouti', 'accepted': [{'passport': false}]},
      {'code': 'DMA', 'name': 'Dominica', 'accepted': [{'passport': false}]},
      {'code': 'DNK', 'name': 'Denmark', 'accepted': [{'passport': false, 'driving_license': false, 'residency_permit': true}]},
      {'code': 'DOM', 'name': 'Dominican Republic', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'DZA', 'name': 'Algeria', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'ECU', 'name': 'Ecuador', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'EGY', 'name': 'Egypt', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'ERI', 'name': 'Eritrea', 'accepted': [{'passport': false}]},
      {'code': 'ESP', 'name': 'Spain', 'accepted': [{'national_identity_card': true}]},
      {'code': 'EST', 'name': 'Estonia', 'accepted': [{'national_identity_card': true}]},
      {'code': 'ETH', 'name': 'Ethiopia', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'FIN', 'name': 'Finland', 'accepted': [{'national_identity_card': true}]},
      {'code': 'FJI', 'name': 'Fiji', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'FRA', 'name': 'France', 'accepted': [{'national_identity_card': true}]},
      {'code': 'FRO', 'name': 'Faroe Islands', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'FSM', 'name': 'Micronesia, Federated States of', 'accepted': [{'passport': false}]},
      {'code': 'GAB', 'name': 'Gabon', 'accepted': [{'passport': false}]},
      {'code': 'GBR', 'name': 'United Kingdom', 'accepted': [{'passport': false, 'driving_license': false, 'residency_permit': false, 'naturalisation_certificate': false, 'home_office_letter': false, 'immigration_status_document': false, 'birth_certificate': false}]},
      {'code': 'GEO', 'name': 'Georgia', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'GGY', 'name': 'Guernsey', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'GHA', 'name': 'Ghana', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'GIB', 'name': 'Gibraltar', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'GIN', 'name': 'Guinea', 'accepted': [{'passport': false}]},
      {'code': 'GMB', 'name': 'Gambia', 'accepted': [{'passport': false}]},
      {'code': 'GNB', 'name': 'Guinea-Bissau', 'accepted': [{'passport': false}]},
      {'code': 'GNQ', 'name': 'Equatorial Guinea', 'accepted': [{'passport': false}]},
      {'code': 'GRC', 'name': 'Greece', 'accepted': [{'national_identity_card': true}]},
      {'code': 'GRD', 'name': 'Grenada', 'accepted': [{'passport': false}]},
      {'code': 'GTM', 'name': 'Guatemala', 'accepted': [{'passport': false, 'driving_license': true, 'national_identity_card': true}]},
      {'code': 'GUY', 'name': 'Guyana', 'accepted': [{'passport': false}]},
      {'code': 'HKG', 'name': 'Hong Kong', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'HND', 'name': 'Honduras', 'accepted': [{'passport': false}]},
      {'code': 'HRV', 'name': 'Croatia', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'HTI', 'name': 'Haiti', 'accepted': [{'passport': false}]},
      {'code': 'HUN', 'name': 'Hungary', 'accepted': [{'national_identity_card': true}]},
      {'code': 'IDN', 'name': 'Indonesia', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'IMN', 'name': 'Isle of Man', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'IND', 'name': 'India', 'accepted': [{'national_identity_card': true}]},
      {'code': 'IRL', 'name': 'Ireland', 'accepted': [{'passport': false, 'passport_card': true, 'driving_license': false, 'residency_permit': true}]},
      {'code': 'IRN', 'name': 'Iran, Islamic Republic of', 'accepted': [{'passport': false}]},
      {'code': 'IRQ', 'name': 'Iraq', 'accepted': [{'passport': false}]},
      {'code': 'ISL', 'name': 'Iceland', 'accepted': [{'national_identity_card': true}]},
      {'code': 'ISR', 'name': 'Israel', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'ITA', 'name': 'Italy', 'accepted': [{'national_identity_card': true}]},
      {'code': 'JAM', 'name': 'Jamaica', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'JEY', 'name': 'Jersey', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'JOR', 'name': 'Jordan', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'JPN', 'name': 'Japan', 'accepted': [{'passport': false, 'driving_license': false, 'residency_permit': false}]},
      {'code': 'KAZ', 'name': 'Kazakhstan', 'accepted': [{'passport': false}]},
      {'code': 'KEN', 'name': 'Kenya', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'KGZ', 'name': 'Kyrgyzstan', 'accepted': [{'passport': false}]},
      {'code': 'KHM', 'name': 'Cambodia', 'accepted': [{'passport': false}]},
      {'code': 'KIR', 'name': 'Kiribati', 'accepted': [{'passport': false}]},
      {'code': 'KNA', 'name': 'Saint Kitts and Nevis', 'accepted': [{'passport': false}]},
      {'code': 'KOR', 'name': 'Korea, Republic of', 'accepted': [{'passport': false}]},
      {'code': 'KWT', 'name': 'Kuwait', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'LAO', 'name': 'Lao People\'s Democratic Republic', 'accepted': [{'passport': false}]},
      {'code': 'LBN', 'name': 'Lebanon', 'accepted': [{'passport': false}]},
      {'code': 'LBR', 'name': 'Liberia', 'accepted': [{'passport': false}]},
      {'code': 'LBY', 'name': 'Libya', 'accepted': [{'passport': false}]},
      {'code': 'LCA', 'name': 'Saint Lucia', 'accepted': [{'passport': false}]},
      {'code': 'LIE', 'name': 'Liechtenstein', 'accepted': [{'national_identity_card': true}]},
      {'code': 'LKA', 'name': 'Sri Lanka', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'LSO', 'name': 'Lesotho', 'accepted': [{'passport': false}]},
      {'code': 'LTU', 'name': 'Lithuania', 'accepted': [{'national_identity_card': true}]},
      {'code': 'LUX', 'name': 'Luxembourg', 'accepted': [{'national_identity_card': true}]},
      {'code': 'LVA', 'name': 'Latvia', 'accepted': [{'national_identity_card': true}]},
      {'code': 'MAC', 'name': 'Macao', 'accepted': [{'residency_permit': false}]},
      {'code': 'MAF', 'name': 'Saint Martin (French part)', 'accepted': [{'driving_license': false}]},
      {'code': 'MAR', 'name': 'Morocco', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'MCO', 'name': 'Monaco', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'MDA', 'name': 'Moldova, Republic of', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'MDG', 'name': 'Madagascar', 'accepted': [{'passport': false}]},
      {'code': 'MDV', 'name': 'Maldives', 'accepted': [{'passport': false}]},
      {'code': 'MEX', 'name': 'Mexico', 'accepted': [{'passport': false, 'driving_license': false, 'voter_id': false, 'work_permit': false}]},
      {'code': 'MHL', 'name': 'Marshall Islands', 'accepted': [{'passport': false}]},
      {'code': 'MKD', 'name': 'Macedonia, the former Yugoslav Republic of', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'MLI', 'name': 'Mali', 'accepted': [{'passport': false}]},
      {'code': 'MLT', 'name': 'Malta', 'accepted': [{'national_identity_card': true}]},
      {'code': 'MMR', 'name': 'Myanmar', 'accepted': [{'passport': false}]},
      {'code': 'MNE', 'name': 'Montenegro', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'MNG', 'name': 'Mongolia', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'MOZ', 'name': 'Mozambique', 'accepted': [{'passport': false}]},
      {'code': 'MRT', 'name': 'Mauritania', 'accepted': [{'passport': false}]},
      {'code': 'MSR', 'name': 'Montserrat', 'accepted': [{'passport': false}]},
      {'code': 'MUS', 'name': 'Mauritius', 'accepted': [{'passport': false}]},
      {'code': 'MWI', 'name': 'Malawi', 'accepted': [{'passport': false}]},
      {'code': 'MYS', 'name': 'Malaysia', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'NAM', 'name': 'Namibia', 'accepted': [{'passport': false}]},
      {'code': 'NER', 'name': 'Niger', 'accepted': [{'passport': false}]},
      {'code': 'NGA', 'name': 'Nigeria', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'NIC', 'name': 'Nicaragua', 'accepted': [{'passport': false}]},
      {'code': 'NLD', 'name': 'Netherlands', 'accepted': [{'national_identity_card': true}]},
      {'code': 'NOR', 'name': 'Norway', 'accepted': [{'passport': false, 'driving_license': false, 'residency_permit': true}]},
      {'code': 'NPL', 'name': 'Nepal', 'accepted': [{'passport': false}]},
      {'code': 'NRU', 'name': 'Nauru', 'accepted': [{'passport': false}]},
      {'code': 'NZL', 'name': 'New Zealand', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'OMN', 'name': 'Oman', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'PAK', 'name': 'Pakistan', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'PAN', 'name': 'Panama', 'accepted': [{'passport': false}]},
      {'code': 'PER', 'name': 'Peru', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'PHL', 'name': 'Philippines', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'PLW', 'name': 'Palau', 'accepted': [{'passport': false}]},
      {'code': 'PNG', 'name': 'Papua New Guinea', 'accepted': [{'passport': false}]},
      {'code': 'POL', 'name': 'Poland', 'accepted': [{'national_identity_card': true}]},
      {'code': 'PRI', 'name': 'Puerto Rico', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'PRK', 'name': 'Korea, Democratic People\'s Republic of', 'accepted': [{'passport': false}]},
      {'code': 'PRT', 'name': 'Portugal', 'accepted': [{'national_identity_card': true}]},
      {'code': 'PRY', 'name': 'Paraguay', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'PSE', 'name': 'Palestinian Territory, Occupied', 'accepted': [{'passport': false}]},
      {'code': 'QAT', 'name': 'Qatar', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'ROU', 'name': 'Romania', 'accepted': [{'national_identity_card': true}]},
      {'code': 'RUS', 'name': 'Russian Federation', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'RWA', 'name': 'Rwanda', 'accepted': [{'passport': false}]},
      {'code': 'SAU', 'name': 'Saudi Arabia', 'accepted': [{'passport': false, 'driving_license': false, 'residency_permit': false}]},
      {'code': 'SDN', 'name': 'Sudan', 'accepted': [{'passport': false}]},
      {'code': 'SEN', 'name': 'Senegal', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'SGP', 'name': 'Singapore', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'SLB', 'name': 'Solomon Islands', 'accepted': [{'passport': false}]},
      {'code': 'SLE', 'name': 'Sierra Leone', 'accepted': [{'passport': false}]},
      {'code': 'SLV', 'name': 'El Salvador', 'accepted': [{'passport': false}]},
      {'code': 'SMR', 'name': 'San Marino', 'accepted': [{'passport': false}]},
      {'code': 'SOM', 'name': 'Somalia', 'accepted': [{'passport': false}]},
      {'code': 'SRB', 'name': 'Serbia', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'SSD', 'name': 'South Sudan', 'accepted': [{'passport': false}]},
      {'code': 'STP', 'name': 'Sao Tome and Principe', 'accepted': [{'passport': false}]},
      {'code': 'SUR', 'name': 'Suriname', 'accepted': [{'passport': false}]},
      {'code': 'SVK', 'name': 'Slovakia', 'driving_license': false, 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'SVN', 'name': 'Slovenia', 'accepted': [{'national_identity_card': true}]},
      {'code': 'SWE', 'name': 'Sweden', 'accepted': [{'national_identity_card': true}]},
      {'code': 'SWZ', 'name': 'Swaziland', 'accepted': [{'passport': false}]},
      {'code': 'SYC', 'name': 'Seychelles', 'accepted': [{'passport': false}]},
      {'code': 'SYR', 'name': 'Syrian Arab Republic', 'accepted': [{'passport': false}]},
      {'code': 'TCA', 'name': 'Turks and Caicos Islands', 'accepted': [{'passport': false}]},
      {'code': 'TCD', 'name': 'Chad', 'accepted': [{'passport': false}]},
      {'code': 'TGO', 'name': 'Togo', 'accepted': [{'passport': false}]},
      {'code': 'THA', 'name': 'Thailand', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'TJK', 'name': 'Tajikistan', 'accepted': [{'passport': false}]},
      {'code': 'TKM', 'name': 'Turkmenistan', 'accepted': [{'passport': false}]},
      {'code': 'TLS', 'name': 'Timor-Leste', 'accepted': [{'passport': false}]},
      {'code': 'TON', 'name': 'Tonga', 'accepted': [{'passport': false}]},
      {'code': 'TTO', 'name': 'Trinidad and Tobago', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'TUN', 'name': 'Tunisia', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'TUR', 'name': 'Turkey', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'TUV', 'name': 'Tuvalu', 'accepted': [{'passport': false}]},
      {'code': 'TWN', 'name': 'Taiwan, Province of China', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'TZA', 'name': 'Tanzania, United Republic of', 'accepted': [{'passport': false, 'driving_license': false, 'voter_id': false}]},
      {'code': 'UGA', 'name': 'Uganda', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'UKR', 'name': 'Ukraine', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'URY', 'name': 'Uruguay', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'USA', 'name': 'United States', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'UZB', 'name': 'Uzbekistan', 'accepted': [{'passport': false}]},
      {'code': 'VEN', 'name': 'Venezuela, Bolivarian Republic of', 'accepted': [{'passport': false, 'national_identity_card': true}]},
      {'code': 'VNM', 'name': 'Viet Nam', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'VUT', 'name': 'Vanuatu', 'accepted': [{'passport': false}]},
      {'code': 'WSM', 'name': 'Samoa', 'accepted': [{'passport': false}]},
      {'code': 'YEM', 'name': 'Yemen', 'accepted': [{'passport': false, 'driving_license': false}]},
      {'code': 'ZAF', 'name': 'South Africa', 'accepted': [{'passport': false, 'driving_license': false, 'national_identity_card': true}]},
      {'code': 'ZMB', 'name': 'Zambia', 'accepted': [{'passport': false}]},
      {'code': 'ZWE', 'name': 'Zimbabwe', 'accepted': [{'passport': false}]},
    ];

    this.countrydocs.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
  }
} window.customElements.define('wbi-application', WbiApplication);
