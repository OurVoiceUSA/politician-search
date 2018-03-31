
import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { _apiCall } from './common';

export default class App extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      apiData: null,
      address: '',
    };
    this.onChange = (address) => this.setState({ address })
  }

  _whorepme = async (position) => {

    this.setState({
      loading: true,
    });

    let body = null;
    try {
      let res = await _apiCall('/api/v1/whorepme?lng='+position.longitude+'&lat='+position.latitude, {address: position.address});
      body = await res.json();
    } catch (error) {
      console.warn(error);
    }

    this.setState({
      loading: false,
      apiData: body,
    });

  }

  submitAddress = async (address) => {
    this.setState({address});

    try {
      let results = await geocodeByAddress(address);
      let latLng = await getLatLng(results[0]);

      this._whorepme({
        longitude: latLng.lng,
        latitude: latLng.lat,
        address: address,
      });
    } catch(error) {
      console.error('Error', error);
    }

  }

  render() {
    const { loading, apiData } = this.state;

    const inputProps = {
      value: this.state.address,
      onChange: this.onChange,
    }

    let nodata;

    if (apiData && !apiData.msg) {

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

      <View style={{flex: 1, backgroundColor: 'white'}}>

        <Text style={{fontSize: 18, marginBottom: 10}}>Enter your address</Text>

        <PlacesAutocomplete inputProps={inputProps} onEnterKeyDown={this.submitAddress} onSelect={this.submitAddress} />

        {loading &&
        <View style={{flex: 1}}>
          <View style={{flex: 1, margin: 10, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 18, textAlign: 'center', marginBottom: 10}}>Loading district information.</Text>
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

        {apiData && !apiData.msg && !loading &&
        <View>
          <Text>{JSON.stringify(apiData.cd)}</Text>
          <Text>{JSON.stringify(apiData.sen)}</Text>
          <Text>{JSON.stringify(apiData.sldl)}</Text>
          <Text>{JSON.stringify(apiData.sldu)}</Text>
          <Text>{JSON.stringify(apiData.other)}</Text>
        </View>
        }

      </View>
    );
  }
}

