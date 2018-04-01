
import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PlacesAutocomplete from 'react-places-autocomplete';
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
      <View style={{margin: 10, padding: 10, borderWidth: 0.5}}>
        <Text>{(obj.name?obj.name:'name is null ... id: '+obj.openstates_id)}</Text>
      </View>
    );
  }

  displayPoliticiansByAddress(apiData) {
    return (
      <View>
        {apiData.cd.map(obj => {return this.displayPoliticiansByOffice(obj)})}
        {apiData.sen.map(obj => {return this.displayPoliticiansByOffice(obj)})}
        {apiData.sldl.map(obj => {return this.displayPoliticiansByOffice(obj)})}
        {apiData.sldu.map(obj => {return this.displayPoliticiansByOffice(obj)})}
        {apiData.other.map(obj => {return this.displayPoliticiansByOffice(obj)})}
      </View>
    );
  }

  displayPoliticiansByOffice(obj) {
    return (
      <View>
        <h3>{obj.name}</h3>
        <Text>{obj.incumbents && obj.incumbents.map(obj => {return this.displayPolitician(obj)})}</Text>
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

      <View style={{flex: 1, margin: 10, maxWidth: 900, backgroundColor: 'white'}}>

        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{width: 300, alignItems: 'flex-start'}}>
            <h1>Politician Search</h1>
          </View>
          <View style={{width: 300, alignItems: 'center'}}>
            <a href="https://ourvoiceusa.org">
              <img style={{maxWidth: 150, resizeMode: 'center'}} src="https://ourvoiceusa.org/wp-content/uploads/2017/09/OV-fullcolor-logo-BluetypeAI.png" />
            </a>
            <Text>This tool is powered by <a href="https://ourvoiceusa.org">Our Voice USA.</a></Text>
          </View>
          <View style={{width: 300, alignItems: 'center'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text>This is a web version of our mobile app. Calling your representatives is just a few taps away!</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <a href="https://play.google.com/store/apps/details?id=org.ourvoiceinitiative.ourvoice"><img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" height="58" width="150" /></a>
              <a href="https://itunes.apple.com/us/app/our-voice-usa/id1275301651?ls=1&amp;mt=8"><img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" height="43" width="130" /></a>
            </View>
          </View>
        </View>

        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => this.toggleSearch(false)}
            style={{
              backgroundColor: (!this.state.searchByName?'#36C3E0':'#FFFFFF'),
              padding: 10, borderColor: '#000000', borderWidth: 0.5, borderRadius: 20, maxWidth: 150, alignItems: 'center'
            }}>
            <Text>Search by Address</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.toggleSearch(true)}
            style={{
              backgroundColor: (this.state.searchByName?'#36C3E0':'#FFFFFF'),
              padding: 10, borderColor: '#000000', borderWidth: 0.5, borderRadius: 20, maxWidth: 150, alignItems: 'center'
            }}>
            <Text>Search by Name</Text>
          </TouchableOpacity>
        </View>

        {this.state.searchByName &&
        <View>
          <Text style={{fontSize: 18, margin: 10}}>Enter a name, office, party, and/or location. (i.e.; "rick scott", "john congress utah", "colorado state house", "paul senate republican", "ca state senate 20", "wy state senate democrat", etc)</Text>
          <EnhancedInput onEnterKeyDown={this.submitSearch} />
        </View>
        ||
        <View>
          <Text style={{fontSize: 18, margin: 10}}>Enter a street, city, zip code, or state. For best results, enter a full address.</Text>
          <PlacesAutocomplete debounce={500} inputProps={inputProps} onEnterKeyDown={this.submitAddress} onSelect={this.submitAddress} />
        </View>
        }

        {loading &&
        <View style={{flex: 1}}>
          <View style={{flex: 1, margin: 10, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 18, textAlign: 'center', marginBottom: 10}}>
              {this.state.searchByName &&
              <Text>Loading search results.</Text>
              ||
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
          apiData.results.map(obj => {return this.displayPolitician(obj)})}

      </View>
    );
  }
}

