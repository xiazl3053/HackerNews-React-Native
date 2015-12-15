/*
 * Author: Simar (github.com/iSimar)
 * GitHub Project: https://github.com/iSimar/HackerNews-React-Native
*/

'use strict';

var React = require('react-native');

var {
  Text,
  View,
  TouchableHighlight
} = React;

var styles = require("./style");
var api = require("../../Network/api.js");
var UtilFuncs = require("../../Utils/functions.js");

//Views
var PostView = require("../Post/index.ios.js");

var RefreshableListView = require("./Components/RefreshableListView");

module.exports = React.createClass({
  getInitialState: function(){
    return {
        topStoryIDs: null,
        lastIndex: 0
    };
  },
  render: function(){
    return(
        <RefreshableListView renderRow={(row)=>this.renderListViewRow(row)}
                             onRefresh={(page, callback)=>this.listViewOnRefresh(page, callback)}
                             backgroundColor={'#F6F6EF'}
                             loadMoreText={'Load More...'}/>
    );
  },
  renderListViewRow: function(row){
      return(
          <TouchableHighlight onPress={(row)=>this.selectPost(row)}>
            <View style={styles.rowContainer}>
                <Text style={styles.rowCount}>
                    {row.count}
                </Text>
                <View style={styles.rowDetailsContainer}>
                    <Text style={styles.rowTitle}>
                        {row.title}
                    </Text>
                    <Text style={styles.rowDetailsLine}>
                        Posted by {row.by} | {row.score} Points | {row.descendants} Comments
                    </Text>
                    <View style={styles.separator}/>
                </View>
            </View>
          </TouchableHighlight>
      );
  },
  listViewOnRefresh: function(page, callback){
      if (page != 1 && this.state.topStoryIDs){
          this.fetchStoriesUsingTopStoryIDs(this.state.topStoryIDs, this.state.lastIndex, 5, callback);
      }
      else {
      fetch(api.HN_TOP_STORIES_ENDPOINT)
      .then((response) => response.json())
      .then((topStoryIDs) => {
          this.fetchStoriesUsingTopStoryIDs(topStoryIDs, 0, 12, callback);
          this.setState({topStoryIDs: topStoryIDs});
      })
      .done();
      }
  },
  fetchStoriesUsingTopStoryIDs: function(topStoryIDs, startIndex, amountToAdd, callback){
      var rowsData = [];
      var endIndex = startIndex + amountToAdd;
      function iterateAndFetch(){
          if (startIndex < ((endIndex <= topStoryIDs.length) ? endIndex : topStoryIDs.length)){
              fetch(api.HN_ITEM_ENDPOINT+topStoryIDs[startIndex]+".json")
              .then((response) => response.json())
              .then((topStory) => {
                  topStory.count = startIndex+1;
                  rowsData.push(topStory);
                  startIndex++;
                  iterateAndFetch();
              })
              .done();
          }
          else {
              callback(rowsData);
              return;
          }
      }
      iterateAndFetch();
      this.setState({lastIndex: endIndex});
  },
  selectPost: function(post){
    this.props.navigator.push({
      title: "Top Story #"+post.count,
      component: PostView,
      passProps: {post: post}
    });
  }
});
