# crawler.py by Arbie Samong

from BeautifulSoup import BeautifulSoup
import urllib2
import re
import logging

def get_links(url, max_levels=5, current_level=1):
    """ grabs links from the url given; supports 
        searching within sub-links

        url = url to strip links from
        max_levels = max depth of sub links 
        current_level = current sub link level

        returns: a list of results containing urls """
    logging.info("fetching links for %s" % (url,))
    logging.info("current level: %d, max levels: %d" % (current_level, max_levels))
    results = []
    contents = ''
    page = None
    try:
        page = urllib2.urlopen(url)
    except Exception, e:
        logging.error("Error fetching page: %s" % (e,))
        return results

    if page is None:
        logging.warning("No page document fetched, quitting")
        return results

    try:
        soup = BeautifulSoup(page.read())
    except Exception, e:
        logging.error("Error reading page: %s" % (e,))
        return results

    links = soup.findAll('a')
    logging.info('found %d raw links' % len(links))
    if len(links):
        urls = [link.get('href') for link in links if link]
        # make sure links are unique
        urls = list(set(urls))
        total = len(urls)
        logging.info('found %d unique urls' % total)
        if current_level < max_levels:
            logging.info("deeper level available, crawling sub links")
            for url in urls:
                results.extend(get_links(url, max_levels=max_levels, current_level=current_level+1))
                total -= 1
                logging.info("links remaining for this level: %d" % total)
        else:
            results.extend(urls)
    return results

def search(url, term, levels):
    """ perform search on a url for a term
        accepts multiple levels (searching within links)

        url = url to search from
        term = search keyword
        levels = number of levels to search """
    if not url or not term:
        return
    if not levels or levels == '':
        levels = 1
    else:
        levels = int(levels)

    logging.info('fetching links with levels %d' % levels)
    links = get_links(url, levels)
    logging.info('all links found: %s', str(links))
    results = []
    for link in links:
        logging.info('processing link: %s', link)
        if link and link.find(term) != -1:
            results.append(link)

    return results    

def main():
    url_to_parse = raw_input("URL to parse: ")
    if not url_to_parse:
        #logging.warning("No URL provided, quitting")
        #return
        url_to_parse = 'http://www.hackernews.com'

    search_string = raw_input("Search string: ")
    if not search_string:
        #logging.warning("No search string provided, quitting")
        #return
        search_string = 'python'

    levels = raw_input("Levels (default is 1): ")
    if not levels:
        levels = 1
    else:
        levels = int(levels)
    
    results = search(url_to_parse, search_string, levels)
    if results:
        # make sure results are unique
        results = list(set(results))
        logging.info("Results found:")
        #for result in results:
            #logging.info("* %s" % (result,))
        logging.info("End of results")
    else:
        logging.warning("No match found")
        pass

if __name__ == "__main__":
    main()
