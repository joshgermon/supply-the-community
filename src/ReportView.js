import React, { useState } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";
import firebase from "./firebase.js";

/*global google*/

let coordinates;
const db = firebase.firestore();
var geocodeInfo;
var placeName;

const lookupAddress = () => {
  const address = geocodeInfo[0].address_components;
  const locationData = {
    streetName: address[1].short_name,
    suburbName: address[2].long_name,
    placeName: placeName
  };
  return locationData;
};

function ReportView() {
  const [openReport, toggleOpenReport] = useState(false);
  async function saveReport() {
    if (geocodeInfo !== undefined || null) {
      const locationData = await lookupAddress();
      let formInput = {
        stockLevel: document.getElementById("stock-level").value,
        storeName: document.getElementById("store-name").value,
        streetName: locationData.streetName,
        suburbName: locationData.suburbName,
        placeName: locationData.placeName,
        timeReported: firebase.firestore.FieldValue.serverTimestamp(),
        upvotes: 1,
        downvotes: 0
      };
      let data = { ...formInput, ...coordinates };
      console.log("data: " + data);
      db.collection("tp-data")
        .add(data)
        .then(ref => {
          console.log("Added document with ID: ", ref.id);
        });
      toggleOpenReport(false);
    } else {
      console.log("no address entered.");
      document.getElementById("address-error").style.display = "block";
    }
  }

  return (
    <div id="report-view">
      {openReport ? (
        <div id="report-modal">
          <div id="report-form">
            <h2>Submit your Report</h2>
            <ReportForm saveReport={saveReport} />
            <p id="close-btn" onClick={() => toggleOpenReport(false)}>
              CLOSE
            </p>
          </div>
        </div>
      ) : (
        <button
          className="add-report-btn"
          onClick={() => toggleOpenReport(true)}
        >
          Add Report
        </button>
      )}
    </div>
  );
}

function ReportForm(props) {
  return (
    <form>
      <p id="address-error">Please Select a Valid Address</p>
      <SearchBox />
      <select id="stock-level">
        <option>Plenty of Stock</option>
        <option>Limited Stock</option>
        <option>Very Limted Stock</option>
      </select>
      <select id="store-name">
        <option>Woolworths</option>
        <option>Big W</option>
        <option>ALDI</option>
        <option>Target</option>
        <option>Coles</option>
        <option>Costco</option>
        <option>Other</option>
      </select>

      <button type="button" onClick={props.saveReport}>
        Submit Report
      </button>
    </form>
  );
}

function SearchBox() {
  const [address, setAddress] = useState("");
  const searchOptions = {
    location: new google.maps.LatLng(-34, 151),
    radius: 7000,
    types: ["establishment"]
  };

  const handleSelect = async value => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    console.log(results);
    setAddress(value);
    //set global variables to geocode information
    geocodeInfo = results;
    placeName = value;
    coordinates = latLng;
  };

  return (
    <div>
      <PlacesAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
        searchOptions={searchOptions}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
              {...getInputProps({
                placeholder: "Type address",
                id: "search-box"
              })}
            />

            <div id="suggestion-list">
              {loading ? <div>Please Wait..</div> : null}

              {suggestions.map(suggestion => {
                const style = {
                  backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
                };

                return (
                  <div
                    className="suggestion"
                    {...getSuggestionItemProps(suggestion, { style })}
                  >
                    {suggestion.description}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
}

export default ReportView;
