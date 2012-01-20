from BeautifulSoup import BeautifulSoup
import urllib2
import re

def get_links(url, max_levels=5, current_level=1):
    print "fetching links for %s" % (url,)
    print "current level: %d, max levels: %d" % (current_level, max_levels)
    links = []
    contents = ''
    page = None
    try:
        page = urllib2.urlopen(url)
    except Exception, e:
        print "Error fetching page: %s" % (e,)
        return links

    if page is None:
        print "No page document fetched, quitting"
        return links

    try:
        soup = BeautifulSoup(page.read())
    except Exception, e:
        print "Error reading page: %s" % (e,)
        return links

    links = soup.findAll('a')
    print "links found: %d" % len(links)

    if max_levels > current_level:
        print "fetching sub links"
        for link in links:
            url = link.get('href')
            if url:
                links.extend(get_links(url, max_levels, current_level+1))
    return links



def main():
    url_to_parse = raw_input("URL to parse: ")
    if not url_to_parse:
        print "No URL provided, quitting"
        return

    search_string = raw_input("Search string: ")
    if not search_string:
        print "No search string provided, quitting"
        return

    levels = raw_input("Levels (default is 1): ")
    if not levels:
        levels = 1
    else:
        levels = int(levels)
    
    links = get_links(url_to_parse, levels)
    print 'all links found:', links
    results = []
    for link in links:
        url = link.get('href')
        print 'processing url:', url
        if url and url.find(search_string) != -1:
            results.append(url)
    

    if results:
        print "Results found:"
        for result in results:
            print "* %s" % (result,)
    else:
        print "No match found"

if __name__ == "__main__":
    main()
