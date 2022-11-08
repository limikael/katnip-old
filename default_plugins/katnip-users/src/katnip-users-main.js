import {katnip, delay, buildUrl, apiFetch, addSetting, User} from "katnip";
import "./katnip-users-api.js";

import "../auth/google/auth-google-main.js";
import "../auth/sessiontoken/auth-sessiontoken-main.js";
import "../auth/lightning/auth-lightning-main.js";
import "../auth/email/auth-email-main.js";

katnip.createCrudApi(User);

katnip.addSettingCategory("auth",{title: "Authorization", priority: 15});
