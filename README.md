## Questions Chat

Backend requires running ElasticSearch. A quick way to set it up on Docker -

```sh
docker run -d --rm --name elasticsearch -p 9200:9200 -p 9300:9300 -e discovery.type=single-node -e http.cors.enabled=true -e http.cors.allow-origin=http://localhost:1358,http://127.0.0.1:1358 -e http.cors.allow-headers=X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization -e http.cors.allow-credentials=true docker.elastic.co/elasticsearch/elasticsearch:7.6.2
```

Then to start backend -

```sh
cd backend
npm install
npm start
```


To start frontend -

```sh
cd frontend
yarn install
yarn start
```

Some notes - for simplicity's sake, this solution is obviously unscalable. The questions and answers are kept in memory and the online users list is based on having them all connected to same instance's WebSocket. In addition, I send the entire questions feed to all clients on any new question or answer, this will not perform well if the feed is large.
