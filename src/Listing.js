import React, { useState, useEffect } from "react";
import firebase, { db } from "./firebase.js";
import { timeSince } from "./timeSince";

navigator.geolocation.getCurrentPosition(saveLatLong);
var currentLocation;
var votedListings = [];

function distance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit === "K") {
      dist = dist * 1.609344;
    }
    if (unit === "N") {
      dist = dist * 0.8684;
    }

    let result = (Math.round(dist * 100) / 100).toFixed(1);

    return result;
  }
}

async function saveLatLong(position) {
  let locationData = await position;

  const user_position = {
    lat: locationData.coords.latitude,
    lng: locationData.coords.longitude
  };

  currentLocation = user_position;
}

function GetListings(pageCounter, filter) {
  const [listing, setListings] = useState([]);

  useEffect(() => {
    db.collection("tp-data")
      .orderBy("timeReported", "desc")
      .limit(pageCounter)
      .onSnapshot(snapshot => {
        const updatedListings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(updatedListings);
      });
  }, [pageCounter]);

  if (filter === "date") {
    return listing;
  } else {
    if (currentLocation !== undefined || null) {
      return listing.sort(
        (a, b) =>
          distance(
            a.lat,
            a.lng,
            currentLocation.lat,
            currentLocation.lng,
            "K"
          ) -
          distance(b.lat, b.lng, currentLocation.lat, currentLocation.lng, "K")
      );
    } else {
      alert("You have not allowed your location to be shared.");

      return listing;
    }
  }
}

function Listing(props) {
  const [sortFilter, updateSortFilter] = useState("date");
  const [userLocationAllowed, setUserLocationAllowed] = useState();
  const [page, updatePage] = useState(1);
  const listing = GetListings(page * 6, sortFilter);

  function handleVote(vote, id) {
    if (votedListings.includes(id)) {
      alert("You have already voted on this.");
    } else {
      votedListings.push(id);
      console.log(id);
      if (vote === "upvotes") {
        db.collection("tp-data")
          .doc(id)
          .update({ upvotes: firebase.firestore.FieldValue.increment(1) });
      } else {
        db.collection("tp-data")
          .doc(id)
          .update({ downvotes: firebase.firestore.FieldValue.increment(1) });
      }
    }
  }
  function sortByLocation() {
    if (currentLocation === undefined || null) {
      setUserLocationAllowed(false);
      setTimeout(sortByLocation, 1200);
    } else {
      setUserLocationAllowed(true);
    }
  }
  function renderTPLevel(stock) {
    switch (stock) {
      case "Plenty of Stock":
        return (
          <div>
            <img
              className="stock-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />
            <img
              className="stock-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />

            <img
              className="stock-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />
          </div>
        );
      case "Limited Stock":
        return (
          <div>
            <img
              className="stock-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />
            <img
              className="stock-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />

            <img
              className="faded-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />
          </div>
        );
      case "Very Limted Stock":
        return (
          <div>
            <img
              className="stock-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />
            <img
              className="faded-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />

            <img
              className="faded-tp"
              alt="tp"
              src="https://static.thenounproject.com/png/70909-200.png"
            />
          </div>
        );
      default:
        console.log("error stock level");
    }
  }
  function renderStoreImage(store) {
    switch (store) {
      case "Woolworths":
        return "https://res.cloudinary.com/scentre-group-au/image/fetch/c_fill,q_auto,g_faces:auto,w_1152,h_768,f_auto/https://cam.scentregroup.io/m/5a117e7b556172f4";
      case "Coles":
        return "https://www.craigieburncentral.com.au/-/media/retail/au/craigieburn-central/images/whats-on/events/generic/coles_141127_4d6c6873.jpg?as=0&mh=1061&hash=AFDB4A9862CC00BDEAE481ADD615BF1185D877B6";
      case "Costco":
        return "https://www.mainbrace.com.au/wp-content/uploads/2018/12/24-1440x900.jpg";
      case "Big W":
        return "https://media.apnarm.net.au/media/images/2019/04/01/b881879951z1_20190401145557_000g0e1flr5d2-0-k5e3cw49qm9qli042s2_t1880.jpg";
      case "Target":
        return "https://www.channelnews.com.au/wp-content/uploads/2017/06/Target_141127_4D6C7752.jpg";
      default:
        return "https://www.channelnews.com.au/wp-content/uploads/2017/06/Target_141127_4D6C7752.jpg";
    }
  }
  useEffect(() => {
    sortByLocation();
  }, []);
  return (
    <div id="listings_ph">
      <p
        onClick={() => {
          updateSortFilter("dist");
        }}
        id="sort-dist"
      >
        Sort by Near Me
      </p>
      {listing.map(listing => (
        <div key={listing.id} className="listing">
          <div className="store-image">
            {userLocationAllowed ? (
              <p className="distance-away">
                {distance(
                  listing.lat,
                  listing.lng,
                  currentLocation.lat,
                  currentLocation.lng,
                  "K"
                )}{" "}
                KM AWAY
              </p>
            ) : null}
            <img
              alt={listing.storeName}
              src={renderStoreImage(listing.storeName)}
            />
          </div>
          <div className="listing-content">
            <div className="listing-info">
              <h3 className="location">
                {listing.storeName} {listing.suburbName}
              </h3>
              <p className="place-name">
                {listing.streetName}, {listing.suburbName}
              </p>

              {listing.timeReported == null ? null : (
                <p className="report-time">
                  Reported {timeSince(listing.timeReported.toDate())}
                </p>
              )}
            </div>
            <div className="listing-actions">
              <p
                onClick={() => {
                  handleVote("upvotes", listing.id);
                }}
                className="upvote-btn"
              >
                IN STOCK ({listing.upvotes})
              </p>
              <p
                onClick={() => {
                  handleVote("downvotes", listing.id);
                }}
                className="expire-btn"
              >
                EXPIRED ({listing.downvotes})
              </p>
              {renderTPLevel(listing.stockLevel)}
            </div>
          </div>
        </div>
      ))}
      <p className="next-page" onClick={() => updatePage(page + 1)}>
        Load More
      </p>
    </div>
  );
}

export default Listing;
