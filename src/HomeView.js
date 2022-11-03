import React from "react";
import Listing from "./Listing";

function HomeView() {
  return (
    <div id="home-view">
      <NearbyListings />
    </div>
  );
}

function NearbyListings() {
  return (
    <div id="nearby-listings">
      <Listing />
    </div>
  );
}
export default HomeView;
