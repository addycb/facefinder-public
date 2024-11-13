import requests
import base64
import re
import json
import time
import os
import random
import findfaces
import exifdata
import decodefuns
from urllib.parse import quote_plus
import myproxies
maxresults=15




# Add your Google Custom Search API key and Search Engine ID here
google_api_key = "YOUR_GOOGLE_API_KEY"
google_cx = "YOUR_GOOGLE_CX"
user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36"



def download_image(url):
    #try:
        # Send a GET request to the URL
        headers = {
            'sec-ch-ua':'"Not;A=Brand";v="99", "Chromium";v="106"',
            'accept':'application/json, text/plain, */*',
            'content-type':'application/json',
            'sec-ch-ua-mobile': '?0',
            'user-agent':user_agent,
            'sec-fetch-site':'same-origin',
            'sec-fetch-dest':'empty',
            'accept-encoding':'gzip, deflate',
            'accept-language':'en-US,en;q=0.9'
        }
        response = requests.get(url,headers=headers)
        response.raise_for_status()  # Check for request errors

        # Ensure the 'images' directory exists
        if not os.path.exists('images'):
            os.makedirs('images')

        # Get the image file name from the URL
        file_name = os.path.basename(url)
        file_name = file_name.split("?")[0]
        cleaned_file_name = re.sub(r'[^a-zA-Z0-9.]', '', file_name)
        file_path = os.path.join('images', cleaned_file_name)

        # Write the image to disk, overwriting if it exists
        with open(file_path, 'wb') as f:
            f.write(response.content)

        # Return the file path
        return file_path

   # except requests.RequestException as e:
       # print(f"Error downloading image: {e}")
       # return None
    

    
def select_random_user_agent(file_path):
    current_dir = os.path.dirname(__file__)
    file_path = os.path.join(current_dir, file_path)
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()
            if not lines:
                raise ValueError("The file is empty")
            
            # Select a random line
            random_line = random.choice(lines).strip()
            return random_line
    
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' does not exist.")
    except ValueError as ve:
        print(ve)


def upload_image(image_path):
    # Encode the image to base64
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    base64_image="data:image/jpeg;base64,"+base64_image
    # Prepare the payload
    data = {
        "image": base64_image
    }
    # POST request to upload the image
    url = "https://pimeyes.com/api/upload/file"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    cookies=requests.cookies.RequestsCookieJar()
    #Rotate proxy if needed
    myproxies.get_proxy_redis()
    proxies={
        "http":myproxies.worker_proxy,
        "https":myproxies.worker_proxy
    }
    response = requests.post(url, proxies=proxies,headers=headers, cookies=cookies, json=data)
    if response.status_code == 200:
        print("Image uploaded successfully.")
        #print(response.text)
        #print(response.json().get("faces")[0]["id"])
        if not(response.json().get("faces")):
            #print("No faces found in uploaded image.")
            return None, "No faces found in uploaded image."
        elif len(response.json().get("faces"))>1:
            return None, "Multiple faces found in uploaded image. Expected only one."
        else:
            return response.cookies,response.json().get("faces")[0]["id"]
    else:
        print(f"Failed to upload image. Status code: {response.status_code}")
        print(response.text)
        print(response.status_code)
        print(response.json())
        return None, "API Failure. Try again later."

def exec_search(cookies,search_id):
    #Cookies are already Setup, hope uploadperms cookie is
    #Headers are good
    headers = {
    'sec-ch-ua':'"Not;A=Brand";v="99", "Chromium";v="106"',
    'accept':'application/json, text/plain, */*',
    'content-type':'application/json',
    'sec-ch-ua-mobile': '?0',
    'user-agent':user_agent,
    'origin':'https://pimeyes.com',
    'sec-fetch-site':'same-origin',
    'sec-fetch-mode':'cors',
    'sec-fetch-dest':'empty',
    'referer':'https://pimeyes.com/en',
    'accept-encoding':'gzip, deflate',
    'accept-language':'en-US,en;q=0.9'
    }
    url = "https://pimeyes.com/api/search/new"
    data = {
    "faces": [search_id],
    "time": "any",
    "type": "PREMIUM_SEARCH",
    }
    response = requests.post(url,headers=headers,json=data,cookies=cookies)
    if response.status_code == 200:
        # Extract the JSON response body
        #print(response.text)
        json_response = response.json()
        search_hash = json_response.get("searchHash")
        search_collector_hash = json_response.get("searchCollectorHash")
        return search_hash, search_collector_hash
    else:
        print(f"Failed to get searchHash. Status code: {response.status_code}")
        print(response.text)
        return None, None

def extract_url_from_html(html_content):
    # Define the regular expression pattern to find api-url="my_url"
    pattern = r'api-url="([^"]+)"'
    url=re.search(pattern,html_content)
    url = url.group()  # This will give 'api-url="https://jsc12.pimeyes.com/get_results"'
    # Extract the URL from the full match string
    url = re.search(r'https://[^\"]+', url).group()  # This regex extracts the URL
    return url

def find_results(search_hash, search_collector_hash, search_id, cookies):
    url="https://pimeyes.com/en/results/"+search_collector_hash+"_"+search_hash+"?query="+search_id
    response = requests.get(url,cookies=cookies)
    if response.status_code == 200:
        print("Found correct server.")
        return extract_url_from_html(response.text)




def get_results(url,search_hash):
    # Prepare the payload
    data = {
        "hash": search_hash,
        "limit": 250,
        "offset": 0,
        "retryCount": 0
    }
    # POST request to get results 
    headers = {
    'sec-ch-ua':'"Not;A=Brand";v="99", "Chromium";v="106"',
    'accept':'application/json, text/plain, */*',
    'content-type':'application/json',
    'sec-ch-ua-mobile': '?0',
    'user-agent':user_agent,
    'origin':'https://pimeyes.com',
    'sec-fetch-site':'same-origin',
    'sec-fetch-mode':'cors',
    'sec-fetch-dest':'empty',
    'referer':'https://pimeyes.com/',
    'accept-encoding':'gzip, deflate',
    'accept-language':'en-US,en;q=0.9'
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        print("Results obtained successfully.")
        return response.json()
    else:
        print(f"Failed to obtain results. Status code: {response.status_code}")
        print(response.text)




def decode_thumbnails_and_process(json_data):
    results = json_data.get('results', [])
    if len(results) == 0:
        print("Search successful, but no matches found.")
    full_results={"images":[]}
    #Trim to x results
    results=results[:maxresults]
    for result in results:
        #want to return image, contextlinks, link, exifdata
        thumbnail_url = result.get('thumbnailUrl', '')
        # Extract the hex part after /proxy/
        match = re.search(r'/proxy/([0-9a-fA-F]+)', thumbnail_url)
        if match:
            try:
                hex_part = match.group(1)
                ascii_text = decodefuns.hex_to_ascii(hex_part)
                ascii_text=json.loads(ascii_text)
                print(ascii_text)
                piclink=ascii_text.get('url')
                
                #use exiftool to get exif data
                imgpath=download_image(piclink)
                picexifdata=exifdata.get_exif_data(imgpath)
                #print(picexifdata)
                #picexifdata="this is exifdata placeholder"
                #contextlinks=get_unique_contextlinks(piclink)
                #Use google to get context links, or provide prefilled link to google search
                """
                file_name = piclink.split("/")[-1]
                file_name=file_name.split("?")[0]
                domain_name = re.search(r'https?://(www\.)?([^/]+)', piclink).group(2)
                query = f'site:{domain_name} "{file_name}"'
                searchurl=f"https://google.com/search?q={query}"
                """
                #trying to fix context links
                file_name = piclink.split("/")[-1]
                file_name = file_name.split("?")[0]
                domain_match = re.search(r'https?://(?:www\.)?([^/]+)', piclink)
                domain_name = domain_match.group(1)
    # Remove subdomains by splitting and keeping the last two parts
                domain_parts = domain_name.split('.')
                if len(domain_parts) > 2:
                    domain_name = '.'.join(domain_parts[-2:])
                query = f'site:{domain_name} {file_name}'
                encoded_query = quote_plus(query)  # URL-encode the query
                searchurl = f"https://google.com/search?q={encoded_query}"
                
                #Get other people in image, return as possible searches
                #otherpeople=findfaces.find_faces(imgpath)
                
                otherpeople=findfaces.find_faces(imgpath)
                #Delete image after processing
                os.remove(imgpath)
                #return results
                full_results["images"].append({"imagelink":piclink,"otherpeople":otherpeople,"contextlinks":searchurl,"exifdata":picexifdata})

                #print(exifdata.get_exif_data(download_image(ascii_text)))
                #for link in get_unique_contextlinks(ascii_text):
                    #print(link)
            except Exception as e:
                print("An image threw error.",e)
    return full_results

def get_unique_contextlinks(image_url):
    file_name = image_url.split("/")[-1]
    domain_name = re.search(r'https?://(www\.)?([^/]+)', image_url).group(2)
    # Correctly format the query string
    query = f'site:{domain_name} "{file_name}"'
    # Build the search URL for Google Custom Search API
    search_url = f"https://www.googleapis.com/customsearch/v1?key={google_api_key}&cx={google_cx}&q={query}&searchType=image"
    response = requests.get(search_url)
    if response.status_code == 200:
        search_results = response.json().get("items", [])
        context_links = set()  # Use a set to store unique context links
        for result in search_results:
            context_link = result.get('image', {}).get('contextLink')
            if context_link:
                context_links.add(context_link)
        return list(context_links)  # Convert set back to list for returning
    else:
        print(f"Failed to search Google Custom Search API. Status code: {response.status_code}")
        print(response.text)
        return []

def getimg():
    #print("Starting new search")
    while True:
        # Call the upload img func to get cookies and searchid 
        print("Input path to image:")
        image_path = input().strip()
        
        # Check if the file exists and is a file
        if os.path.isfile(image_path):
            return image_path
        else:
            print("Invalid file path. Please try again.")

def search(image_path):
    cookies,search_id=upload_image(image_path)
    if cookies==None:
        #if no cookies: return a json with error message that is inside of search_id
        return {"error":search_id}
    # Set needed cookies
    cookies.set("payment_gateway_v3","fastspring",domain="pimeyes.com")
    cookies.set("uploadPermissions",str(time.time()*1000)[:13],domain="pimeyes.com")
    #Execute search to get search hash info
    search_hash, search_collector_hash = exec_search(cookies,search_id)
    if search_hash and search_collector_hash and cookies:
        # Now you can use search_hash and session_cookies for further API calls
        print("Ready for further API calls.")
    else:
        print("Could not proceed with further API calls.")
    serverurl=find_results(search_hash,search_collector_hash,search_id,cookies)
    res_json=get_results(serverurl,search_hash)
    return decode_thumbnails_and_process(res_json)

#user_agent=select_random_user_agent("user-agents.txt")
#user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36"
#image_path=getimg()
#search(image_path)

#download_image("https://www.dondeir.com/wp-content/uploads/2024/06/exposicion-interactiva-jurassic-world-cdmx.jpg")
#print("nice")