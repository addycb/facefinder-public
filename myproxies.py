import redis
import time

# Initialize Redis client
this_worker_requests=0
max_requests_per_proxy=3
redis_client = redis.Redis(host='localhost', port=6379, db=0)
proxyurl = 'https://ip.smartproxy.com/json'
proxyusername = 'YOURUSERNAME'
proxypassword = 'YOURPASSWORD'
worker_proxy=None



def set_proxy(portnum):
    worker_proxy=f"http://{proxyusername}:{proxypassword}@dc.smartproxy.com:{portnum}"

def get_proxy_redis():
    if(worker_proxy==None or this_worker_requests>=max_requests_per_proxy):
        set_proxy(redis_client.lmove('proxies', 'proxies', 'LEFT', 'RIGHT'))
        this_worker_requests=1
    else:
        this_worker_requests+=1

def log_visitor(ip_address):
    # Use a Redis list to store IP addresses
    redis_client.lpush('visitor_logs', ip_address+str(time.time()))
    
    # Trim the list to keep only the last 1000 IP addresses
    redis_client.ltrim('visitor_logs', 0, 999)
def log_image(ip_address,filename):
    # Use a Redis list to store image filenames
    redis_client.lpush('uploads', ip_address+str(time.time())+filename)
    
    # Trim the list to keep only the last 1000 image filenames
    redis_client.ltrim('uploads', 0, 999)