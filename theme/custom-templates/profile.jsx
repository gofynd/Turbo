import React from "react";

function Profile() {
  return (
    <>
      <h1 style={{ color: "red" }}>
        This is a custom page for Profile in flow
      </h1>
      <hr />
    </>
  );
}

Profile.serverFetch = () => {};

export default Profile;
