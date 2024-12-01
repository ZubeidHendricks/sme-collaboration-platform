import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Web3Provider, ProjectProvider, UserProvider } from './context';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import Governance from './pages/Governance';

function App() {
  return (
    <Web3Provider>
      <UserProvider>
        <ProjectProvider>
          <Router>
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route path="/projects" component={Projects} />
              <Route path="/profile" component={Profile} />
              <Route path="/governance" component={Governance} />
            </Switch>
          </Router>
        </ProjectProvider>
      </UserProvider>
    </Web3Provider>
  );
}

export default App;