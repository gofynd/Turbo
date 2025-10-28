import { isRunningOnClient } from "./utils";
import { USER_DATA_QUERY } from "../queries/libQuery";

// return true if user is logged in
// return false if user is not logged in redirect to login page.
export async function isLoggedIn({ fpi, store }) {

  try {
    const isBoolean = typeof store?.auth?.logged_in === "boolean";
    if (isBoolean) {
      const loggedIn = store?.auth?.logged_in;
      return loggedIn;
    }
    const userData = await fpi.executeGQL(USER_DATA_QUERY);
    return !!(userData?.data?.user?.logged_in_user ?? false);
  } catch (error) {
    return false;
  }
}

export async function loginGuard({ fpi, store }) {
  try {
    const loggedIn = await isLoggedIn({ fpi, store });
    const locale = fpi?.store?.getState?.()?.custom?.i18nDetailsKey?.language?.locale; 
    if (loggedIn && isRunningOnClient()) {
      const path = locale && locale !== "en" ? `/${locale}` : "/";
      window.location.href = path;
      return false;
    }
    return true;
  } catch (error) {
    return true;
  }
}
