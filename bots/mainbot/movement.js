'use strict';

import {SPECS} from 'battlecode';
import utilities from "./utilities.js";
const movement = {};

movement.moveTo = (self, x, y) => {
    if(!self.map[x] || !self.map[0][y]){
        return [];
    }
    let path = movement.aStar(self, [self.me.y, self.me.x], [y, x], self.map);
    return path
};


movement.aStar = (self, start, dest, theMap) => {
    // List of available discovered nodes
    let openList = [];
    // The map
    let map = [];

    // Used to hold nodes adjacent to curr
    let adjacent = [];

    // Used to track the current square
    let curr = null;
    // Use to get the index of the selected node, this way we can remove it from the openList
    let currIndex = 0;
    let neighbor = null;
    let gScore = 0;

    // Set up the map. If map[x][y] is false then it is impassable
    for (let y = 0; y < theMap.length; ++y) {
        map[y] = [];
        for (let x = 0; x < theMap[y].length; ++x) {
            map[y][x] =
                { g:0,
                  h:0,
                  f:0,
                  x:x,
                  y:y,
                  parent:null,
                  seen:false };
            if(theMap[y][x]) {
                map[y][x].closed = false;
            }
            else{
                map[y][x].closed = true;
            }
        }
    }

    let goal = map[dest[0]][dest[1]];

    // If the target dest is impassable
    if (!goal){
        return false;
    }

    // Start at the bot's current position
    openList.push(map[start[0]][start[1]]);

    while (openList.length > 0) {
        currIndex = movement.selectNext(openList);
        curr = openList[currIndex];

        if(curr === goal) {
            return movement.retracePath(self, start, goal)
        }
        // Take the current node off of the openList and set it to closed
        openList.splice(currIndex, 1);
        curr.closed = true;

        adjacent = movement.getOpenAdj(map, curr);

        for(let i = 0; i < adjacent.length; ++i){
            neighbor = adjacent[i];
            gScore = curr.g + utilities.getDistance(curr, neighbor);

            if(!neighbor.seen){
                neighbor.seen = true;
                openList.push(neighbor);
                neighbor.parent = curr;
                neighbor.g = gScore;
                neighbor.h = utilities.getDistance(curr, goal);
                neighbor.f = neighbor.g + neighbor.h
            }
            else if(gScore < neighbor.g){
                neighbor.parent = curr;
                neighbor.g = gScore;
                neighbor.h = utilities.getDistance(curr, goal);
                neighbor.f = neighbor.g + neighbor.h
            }

        }

    }

};

movement.retracePath = (self, start, goal) => {
    // Start at the end of the path and work back to the start
    let parent = goal.parent;
    let path = [];

    path.push(goal);
    while(parent !== null && parent !== start){
        path.push(parent);
        parent = parent.parent
    }
    return path.reverse();
};

movement.selectNext = (openList) => {
    let min = openList[0].f;
    let minInd = 0;

    for (let i=1; i < openList.length; ++i){
        if (openList[i].f < min){
            minInd = i
        }
    }
    return minInd
};

movement.getOpenAdj = (map, curr) => {

    // All adjacent nodes
    let adj;
    if(!map[0][curr.x+1]){
        adj = [map[curr.y][curr.x - 1], map[curr.y + 1][curr.x], map[curr.y - 1][curr.x],
               map[curr.y - 1][curr.x - 1], map[curr.y + 1][curr.x -1]];
    }
    else if(!map[0][curr.x-1]){
        adj = [map[curr.y][curr.x + 1], map[curr.y + 1][curr.x], map[curr.y - 1][curr.x],
               map[curr.y + 1][curr.x + 1], map[curr.y - 1][curr.x + 1]];
    }
    else if(!map[curr.y+1]){
        adj = [map[curr.y][curr.x + 1], map[curr.y][curr.x - 1], map[curr.y - 1][curr.x],
               map[curr.y - 1][curr.x - 1], map[curr.y - 1][curr.x + 1]];
    }
    else if(!map[curr.y-1]){
        adj = [map[curr.y][curr.x + 1], map[curr.y][curr.x - 1], map[curr.y + 1][curr.x],
               map[curr.y + 1][curr.x + 1], map[curr.y + 1][curr.x -1]];
    }
    else{
        adj = [map[curr.y][curr.x + 1], map[curr.y][curr.x - 1], map[curr.y + 1][curr.x], map[curr.y - 1][curr.x],
               map[curr.y + 1][curr.x + 1], map[curr.y - 1][curr.x - 1], map[curr.y - 1][curr.x + 1], map[curr.y + 1][curr.x -1]];
    }
    // All adjacent nodes that are open
    let openAdj = [];

    for(let i = 0; i < adj.length; ++i){
        if(adj[i] && !adj[i].closed){
            openAdj.push(adj[i])
        }
    }
    return openAdj
};


export default movement;