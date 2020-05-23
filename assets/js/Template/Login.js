import React, {useState} from "react";
import {withRouter, Redirect} from "react-router-dom";

import axios from 'axios';

import {withStyles, Grid, TextField, Button} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

const styles = theme => ({
  content: {
    maxWidth: 600,
    width: '100%',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%'
  }
});

const Login = ({classes}) => {
  const [token, setToken] = useState(null);
  const [loginError, setLoginError] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const clickLogin = () => axios.post(
    process.env.API_URL + '/api/login_check',
    {
      "username": username,
      "password": password
    },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .catch(res => {
      if (401 === res.response.status) {
        setLoginError(true);
      }
    })
    .then(res => {
      if(res !== undefined) {
        localStorage.setItem('token', res.data.token)
        setLoginError(false);
        setToken(res.data.token);
      }
    });

  const handleUsername = (event) => {
    setUsername(event.target.value);
  };
  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

  return null !== token ? <Redirect to={'/token'}/> :
    (<div className={classes.container}>
      <div className={classes.content}>
        <Grid container spacing={8}>
          <Grid item md={true} sm={true} xs={true}>
          {loginError ? <Alert variant="filled" severity="warning">Los credenciales que ha introducido no son
            correctos</Alert> : ''}
          </Grid>
        </Grid>
        <Grid container spacing={8}>
          <Grid item md={true} sm={true} xs={true}>
            <TextField id="username" label="Username" type="email" onChange={handleUsername} fullWidth autoFocus
                       required
                       variant="outlined"/>
          </Grid>
        </Grid>
        <Grid container spacing={8}>
          <Grid item md={true} sm={true} xs={true}>
            <TextField id="password" label="Password" type="password" onChange={handlePassword} fullWidth required
                       variant="outlined"/>
          </Grid>
        </Grid>
        <Grid container justify="center" style={{marginTop: '30px'}}>
          <Button variant="outlined" fullWidth color="primary" onClick={clickLogin}>Login</Button>
        </Grid>
      </div>
    </div>);
}

export default withRouter(withStyles(styles)(Login));