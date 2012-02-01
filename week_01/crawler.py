from BeautifulSoup import BeautifulSoup
import urllib2
import re

def get_links(url, max_levels=5, current_level=1):
    print "fetching links for %s" % (url,)
    print "current level: %d, max levels: %d" % (current_level, max_levels)
    results = []
    contents = ''
    page = None
    try:
        page = urllib2.urlopen(url)
    except Exception, e:
        print "Error fetching page: %s" % (e,)
        return results

    if page is None:
        print "No page document fetched, quitting"
        return results

    try:
        soup = BeautifulSoup(page.read())
    except Exception, e:
        print "Error reading page: %s" % (e,)
        return results

    links = soup.findAll('a')
    if len(links):
        urls = [link.get('href') for link in links if link]
        # make sure links are unique
        urls = list(set(urls))
        total = len(urls)
        print 'urls found: %d' % total
        if current_level < max_levels:
            print "deeper level available, crawling sub links"
            for url in urls:
                results.extend(get_links(url, max_levels=max_levels, current_level=current_level+1))
                total -= 1
                print 'links remaining: %d' % total
    return results



def main():
    url_to_parse = raw_input("URL to parse: ")
    if not url_to_parse:
        #print "No URL provided, quitting"
        #return
        url_to_parse = 'http://www.hackernews.com'

    search_string = raw_input("Search string: ")
    if not search_string:
        #print "No search string provided, quitting"
        #return
        search_string = 'python'

    levels = raw_input("Levels (default is 1): ")
    if not levels:
        levels = 1
    else:
        levels = int(levels)
    
    links = get_links(url_to_parse, levels)
    print 'all links found:', links
    results = []
    for link in links:
        print 'processing link:', link
        if link and link.find(search_string) != -1:
            results.append(link)

    if results:
        # make sure results are unique
        results = list(set(results))
        print "Results found:"
        for result in results:
            print "* %s" % (result,)
    else:
        print "No match found"

if __name__ == "__main__":
    main()
