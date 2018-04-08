
import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PlacesAutocomplete from 'react-places-autocomplete';
import Icon from 'react-fontawesome';
import onEnter from 'react-onenterkeydown';
import { _apiCall } from './common';

const EnhancedInput = onEnter("input");

export default class App extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      apiData: null,
      address: '',
      searchByName: false,
    };
    this.onChange = (address) => this.setState({ address })
  }

  submitAddress = async (address) => {
    this.setState({address, loading: true});

    let body = null;
    try {
      let res = await _apiCall('/api/v1/whorepme', {address: address});
      body = await res.json();
    } catch(e) {
      console.warn(e);
    }

    this.setState({
      loading: false,
      apiData: body,
    });

  }

  submitSearch = async (e) => {
    this.setState({loading: true});

    let body = null;
    try {
      let res = await _apiCall('/api/v1/search?str='+e.target.value);
      body = await res.json();
    } catch(e) {
      console.warn(e);
    }

    this.setState({
      loading: false,
      apiData: body,
    });

  }

  toggleSearch(flag) {
    this.setState({apiData: null, searchByName: flag});
  }

  displayPolitician(obj) {
    return (
      <View style={{flexDirection: 'row', margin: 10, padding: 10, borderWidth: 0.5}}>
        <View style={{marginRight: 10}}>
          <img style={{width: 150, resizeMode: 'center'}} alt="" src={(obj.photo_url?obj.photo_url:'https://ourvoiceusa.org/wp-content/uploads/2017/12/thinker-400x250.jpg')} />
        </View>
        <View style={{width: 425}}>
          <h2>{obj.name}</h2>
          <h3>{obj.office}, {obj.divisionName}</h3>
          <View style={{flex: 1}}>
            <Text>
              {this._partyNameFromKey(obj.party)}
            </Text>

            <View style={{flex: 1, marginTop: 7}}>
              <View style={{flexDirection: 'row'}}>
                <View style={{marginRight: 5}}>
                  <Text>Phone:</Text>
                </View>
                <View>
                  <Text>{(obj.phone?obj.phone:"N/A")}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{marginRight: 7}}>
                  <Text>Email:</Text>
                </View>
                <View>
                  <Text>{(obj.email?obj.email:"N/A")}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text>Mailing Address:</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text>{(obj.address?obj.address:"N/A")}</Text>
              </View>
            </View>

          </View>
          <View style={{flexDirection: 'row'}}>
            {this.linkSM(obj, 'phone', 'phone-square', '#5BC236')}
            {this.linkSM(obj, 'email', 'envelope-square', '#0076ff')}
            {this.linkSM(obj, 'facebook', 'facebook', '#3b5998')}
            {this.linkSM(obj, 'twitter', 'twitter', '#0084b4')}
            {this.linkSM(obj, 'youtube', 'youtube-play', '#ff0000')}
            {this.linkSM(obj, 'wikipedia_id', 'wikipedia-w', '#000000')}
            {this.linkSM(obj, 'url', 'globe', '#008080')}
          </View>
        </View>
        <View>
          <Text style={{margin: 10, marginLeft: 0}}>Data Sources for this record:</Text>
          {this.displayDataSources(obj.data_sources)}
        </View>
      </View>
    );
  }

  displayDataSources(refs) {
    let items = [];

    for (let r in refs) {
      let ref = refs[r];

      items.push(
        <View key={r}>
          <Text><a href={ref.url} target="_blank">{ref.name}</a>{(ref.id?' ('+ref.id+')':'')}</Text>
        </View>
      );
    }

    return (
      <View>
        { items }
      </View>
    );
  }

  linkSM(obj, sm, icon, color) {
    return (
      <Icon name={icon} size='2x' style={{margin: 10, color: (obj[sm] ? color : '#e3e3e3')}} />
    );
  }

  _partyNameFromKey(party) {
    switch (party) {
      case 'D': return 'Democrat';
      case 'R': return 'Republican';
      case 'I': return 'Independent';
      case 'G': return 'Green';
      case 'L': return 'Libertarian';
      default: return '';
    }
  }

  displayPoliticiansByAddress(apiData) {
    return (
      <View style={{flex: 0}}>
      <View>
        {apiData.cd.map(obj => {return this.displayPoliticiansByOffice(obj)})}
      </View>
      <View>
        {apiData.sen.map(obj => {return this.displayPoliticiansByOffice(obj)})}
      </View>
      <View>
        {apiData.sldl.map(obj => {return this.displayPoliticiansByOffice(obj)})}
      </View>
      <View>
        {apiData.sldu.map(obj => {return this.displayPoliticiansByOffice(obj)})}
      </View>
      <View>
        {apiData.other.map(obj => {return this.displayPoliticiansByOffice(obj)})}
      </View>
      </View>
    );
  }

  displayPoliticiansBySearch(apiData) {
    if (!apiData.results || apiData.results.length == 0)
      return (<Text>No results found for your query.</Text>);

    return apiData.results.map(obj => {return this.displayPolitician(obj)});
  }

  displayPoliticiansByOffice(obj) {
    return (
      <View>
        <h3>{obj.name}</h3>
        {obj.incumbents && obj.incumbents.map(obj => {return this.displayPolitician(obj)})}
      </View>
    );
  }

  render() {
    const { loading, apiData } = this.state;

    const inputProps = {
      value: this.state.address,
      onChange: this.onChange,
    }

    let nodata;

    if (apiData && !apiData.msg && !this.state.searchByName) {

      if (apiData.cd.length === 0) {
        nodata = {key: 1, title: 'U.S. House of Representatives'};
        apiData.cd.push(nodata);
      }

      if (apiData.sen.length === 0) {
        nodata = {key: 1, title: 'U.S. Senate'};
        apiData.sen.push(nodata);
      }

      if (apiData.sldl.length === 0) {
        nodata = {key: 1, title: 'State Legislative Lower House'};
        apiData.sldl.push(nodata);
      }

      if (apiData.sldu.length === 0) {
        nodata = {key: 1, title: 'State Legislative Upper House'};
        apiData.sldu.push(nodata);
      }

      if (apiData.other.length === 0) {
        nodata = {key: 1, title: 'State/Local Officials'};
        apiData.other.push(nodata);
      }

    }

    return (

      <View style={{flex: 1, margin: 10, width: 900, backgroundColor: 'white'}}>

        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{width: 300, alignItems: 'center'}}>
            <h1>Politician Search</h1>
            <Text>Find out who represents you in public office, how to contact them, and other related information.</Text>
          </View>
          <View style={{width: 300, alignItems: 'center'}}>
            <a href="https://ourvoiceusa.org">
              <img style={{width: 150, resizeMode: 'center'}} alt="Our Voice USA Logo" src="https://ourvoiceusa.org/wp-content/uploads/2017/09/OV-fullcolor-logo-BluetypeAI.png" />
            </a>
            <Text>This tool is powered by <a href="https://ourvoiceusa.org">Our Voice USA</a>.</Text>
            <Text>Find the <a href="https://github.com/OurVoiceUSA/whorepme">source code here</a>.</Text>
          </View>
          <View style={{width: 300, alignItems: 'center'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text>This is a web version of our mobile app. Calling your representatives is just a few taps away!</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <a href="https://play.google.com/store/apps/details?id=org.ourvoiceinitiative.ourvoice"><img alt="Google Play Store" src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" height="62" width="158" /></a>
              <a href="https://itunes.apple.com/us/app/our-voice-usa/id1275301651?ls=1&amp;mt=8"><img alt="Apple Store" src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" height="43" width="130" /></a>
            </View>
          </View>
        </View>

        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => this.toggleSearch(false)}
            style={{
              backgroundColor: (!this.state.searchByName?'#36C3E0':'#FFFFFF'),
              padding: 10, borderColor: '#000000', borderWidth: 0.5, borderRadius: 20, width: 150, alignItems: 'center'
            }}>
            <Text>Search by Address</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.toggleSearch(true)}
            style={{
              backgroundColor: (this.state.searchByName?'#36C3E0':'#FFFFFF'),
              padding: 10, borderColor: '#000000', borderWidth: 0.5, borderRadius: 20, width: 150, alignItems: 'center'
            }}>
            <Text>Search by Name</Text>
          </TouchableOpacity>
        </View>

        {this.state.searchByName &&
        <View>
          <Text style={{fontSize: 18, margin: 10}}>Enter a name, office, party, and/or location. (i.e.; "rick scott", "john congress utah", "colorado state house", "paul senate republican", "ca state senate 20", "wy state senate democrat", etc)</Text>
          <EnhancedInput onEnterKeyDown={this.submitSearch}
            style={{display: 'inline-block', width: '100%', padding: '10px'}}
            />
        </View>
        }
        {!this.state.searchByName &&
        <View>
          <Text style={{fontSize: 18, margin: 10}}>Enter a street, city, zip code, or state. For best results, enter a full address.</Text>
          <PlacesAutocomplete debounce={500} inputProps={inputProps} onEnterKeyDown={this.submitAddress} onSelect={this.submitAddress} />
        </View>
        }

        {apiData && !apiData.msg && !loading &&
        <View style={{flex: 1, margin: 20}}>
          <Text>
            NOTE: Information displayed here is indexed from external sources. We do not warrant
            or guarantee its accuracy or completeness. For any corrections, please contact
            the source of the data listed with each record.
          </Text>
        </View>
        }

        {loading &&
        <View style={{flex: 1}}>
          <View style={{flex: 1, margin: 10, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 18, textAlign: 'center', marginBottom: 10}}>
              {this.state.searchByName &&
              <Text>Loading search results.</Text>
              }
              {!this.state.searchByName &&
              <Text>Loading district information.</Text>
              }
            </Text>
            <ActivityIndicator />
          </View>
        </View>
        }

        {apiData && apiData.msg && !loading &&
        <View style={{flex: 1}}>
          <View style={{flex: 1, margin: 10, justifyContent: 'center', alignItems: 'center'}}>
            <Text>{apiData.msg}</Text>
          </View>
        </View>
        }

        {apiData && !apiData.msg && !loading && !this.state.searchByName &&
          this.displayPoliticiansByAddress(apiData)}

        {apiData && !apiData.msg && !loading && this.state.searchByName &&
          this.displayPoliticiansBySearch(apiData)}

      </View>
    );
  }
}

