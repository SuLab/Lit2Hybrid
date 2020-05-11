export class eUtils {
    static GetPubmedUrl(term, modifier) {
        let search = term + ' AND ' + modifier;
        let pubmedBaseUrl = "https://www.ncbi.nlm.nih.gov/pubmed/?term=";
        var pubmedUrl = pubmedBaseUrl + search;
        return encodeURI(pubmedUrl);
    }

    static geteUtilsUrl(term, modifier) {
        let search = term + ' AND ' + modifier;
        var eUtilsBaseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&rettype=count&term=";
        var eUtilsUrl = eUtilsBaseUrl + search + "&retmode=json";
        return encodeURI(eUtilsUrl);
    }

    static ValidateInputString(inputString) {
        var formatted = inputString.split('\n').filter(x => x);
        return formatted;
    }
}