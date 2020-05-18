export class eUtils {
    static getPubmedUrl(term, modifier) {
        let search = term + ' AND ' + modifier;
        search = !term ? modifier : !modifier ? term : search
        let pubmedBaseUrl = "https://www.ncbi.nlm.nih.gov/pubmed/?term=";
        var pubmedUrl = pubmedBaseUrl + search;
        return encodeURI(pubmedUrl);
    }

    static geteUtilsUrl(term, modifier) {
        let search = term + ' AND ' + modifier;
        search = !term ? modifier : !modifier ? term : search
        var eUtilsBaseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&rettype=count&term=";
        var eUtilsUrl = eUtilsBaseUrl + search + "&retmode=json";
        return encodeURI(eUtilsUrl);
    }
}