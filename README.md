# tania-art-portal

(table rows can be dragged up and down to change priority)
![alt text](https://i.imgur.com/sBlJB8B.png)
![alt text](https://i.imgur.com/0NT6waJ.png)
![alt text](https://i.imgur.com/LFcA7PU.png)
![alt text](https://i.imgur.com/d6QCf21.png)

## What is it?
A CMS for the main site azulila.art (https://github.com/Reubunbun/azulila.art), so that gallery images and commission details can be updated without the need of me changing the code.
The URL for this site is hidden, and the main content is password protected. Once the user has been signed in, a JWT is created so that future visits dont requite sign ins.  

This is a simple create-react-app that makes use of netlify functions for api routes.  
  
Gallery images can be added with display names and descriptions, and also tags which can be used to filter on the main website. The order in which they appear on the page can also be edited.  
Images get uploaded to S3, and then the generated URL is saved into the tania_portfolio_images table.  
tags are saved to tania_portfolio_tags table so that we can easily lookup which images exist for which tag, even when there are multiple tags per image.  
  
Options for the commission/selectType and commission/selectBackground pages can also be updated here, where prices, offers and example images can be incuded.

## Setup locally for anyone curious
```
npm install netlify-cli -g
npm install
netlify dev
```
Note you should add a .env file with TOKEN=WhateverYouWantHere - this would be what the password is.

## Database schema
```
CREATE TABLE `tania_portfolio_images` (
  `image_id` int unsigned NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` mediumtext NOT NULL,
  `priority` int unsigned NOT NULL,
  `width` int unsigned DEFAULT NULL,
  `height` int unsigned DEFAULT NULL,
  PRIMARY KEY (`image_id`)
);

CREATE TABLE `tania_portfolio_tags` (
  `image_id` int unsigned NOT NULL,
  `tag_name` varchar(255) NOT NULL,
  KEY `tania_portfolio_tags_FK` (`image_id`),
  CONSTRAINT `tania_portfolio_tags_FK` FOREIGN KEY (`image_id`) REFERENCES `tania_portfolio_images` (`image_id`) ON DELETE CASCADE
);

CREATE TABLE `tania_portfolio_comm_types` (
  `type_id` int unsigned NOT NULL AUTO_INCREMENT,
  `display` varchar(255) NOT NULL,
  `price` int unsigned NOT NULL,
  `offer` int unsigned DEFAULT NULL,
  `example_url` varchar(255) NOT NULL,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `tania_portfolio_comm_types_UN` (`display`)
);

CREATE TABLE `tania_portfolio_comm_bgs` (
  `background_id` int unsigned NOT NULL AUTO_INCREMENT,
  `display` varchar(255) NOT NULL,
  `price` int unsigned NOT NULL,
  `offer` int unsigned DEFAULT NULL,
  `example_url` varchar(255) NOT NULL,
  PRIMARY KEY (`background_id`),
  UNIQUE KEY `tania_portfolio_comm_bgs_UN` (`display`)
);

CREATE TABLE `tania_portfolio_comm_spaces` (
  `num_spaces` int unsigned DEFAULT NULL
);
```

