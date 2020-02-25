import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { renderRoutes } from "react-router-config";
import { css } from '@emotion/core';
import _ from 'lodash';

const styles = {
  user: css`
    padding: 80px;
    border: 4px double #1C6EA4;
    list-style: none;
	  margin: 10px;
  `,
};

function Users({ usersStyle, users }) {

  if (!users) {
    return (
      <p>loading</p>
    );
  }

  return (
    <div css={usersStyle}>
      <ul>
        {_.map(users, user =>
          <li key={user.id} css={styles.user}>
            <h2>{user.name}</h2>
            <h2>{user.active ? 'active' : 'unactive'}</h2>
          </li>
        )}
      </ul>
    </div>
  )
};

export default Users;
