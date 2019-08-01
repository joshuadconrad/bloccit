'use strict';
module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define('Topic', {
    title: DataTypes.STRING,
    description: DataTypes.STRING
  }, {});
  Topic.associate = function(models) {
    // associations can be defined here
    Topic.hasMany(models.Banner, {
     foreignKey: "topicsId",
     as: "Banners"
   });
   Topic.hasMany(models.Rule, {
    foreignKey: "topicsId",
    as: "Rules"
  });
  };
  return Topic;
};
