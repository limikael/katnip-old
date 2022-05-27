import ClientOAuth2 from "client-oauth2";
import {catnip} from "catnip";

export function createGoogleAuthClient(origin) {
	return new ClientOAuth2({
		clientId: catnip.getSetting("googleClientId"),
		clientSecret: catnip.getSetting("googleClientSecret"),
		accessTokenUri: 'https://oauth2.googleapis.com/token',
		authorizationUri: 'https://accounts.google.com/o/oauth2/auth',
		redirectUri: origin+'/auth',
		scopes: ['https://www.googleapis.com/auth/userinfo.email']
	});
}
