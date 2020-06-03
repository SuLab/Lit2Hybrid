import { eUtils } from "./eUtils"

export class Request {
    static async getCount(term, modifier, apiKey = "") {
        let url = eUtils.geteUtilsUrl(term, modifier, apiKey);

        const response = await fetch(url);
        if (!response.ok) throw new Error(response);

        const json = await response.json();

        const count = json.esearchresult.count; 
        return count;
    }

    static async isApiKeyValid(term, apiKey) {
        let isValid = false;
        let url = eUtils.geteUtilsUrl(term, "", apiKey);

        const response = await fetch(url);
        if (!response.ok) throw new Error(response);

        const json = await response.json();

        isValid = "count" in json.esearchresult;
        return isValid;
    }
}