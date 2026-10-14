import os,json,urllib.request
ACCOUNT='dcb411ece67dfdfb730635133ed31825'
WORKER='urbanprocures-advanced-production-20261007'
DATABASE='3412487b-954b-4f21-92d3-20d85d30dc11'
def cf(path,method='GET',body=None,content_type='application/json'):
 data=None if body is None else body if isinstance(body,bytes) else json.dumps(body).encode()
 req=urllib.request.Request('https://api.cloudflare.com/client/v4'+path,data=data,method=method,headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN'],'Content-Type':content_type})
 with urllib.request.urlopen(req) as r:return r.read()
def query(sql,params=[]):
 r=json.loads(cf(f'/accounts/{ACCOUNT}/d1/database/{DATABASE}/query','POST',{'sql':sql,'params':params}))
 if not r.get('success'):raise RuntimeError('Cloudflare query failed')
 return r['result'][0]['results']
