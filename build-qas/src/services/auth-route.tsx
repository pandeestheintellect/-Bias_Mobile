import { RouteComponentProps, Redirect, Route } from 'react-router-dom';
import React from 'react';
import { NonAuthRoutes } from '../models/routes';
import { getUserInfo } from '../utilities/user-functions';

interface Props {
	Component: React.FC<RouteComponentProps>| React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
	path: string;
	exact?: boolean;
};

export const AuthRoute = ({ Component, path, exact = false }: Props): JSX.Element => {
	const isAuthed = getUserInfo().isLoggedIn;
	const message = 'Please log in to view this page'

	return (
		<Route
			exact={exact}
			path={path}
			render={(props: RouteComponentProps) =>
				isAuthed ? (
					
					<Component {...props} />
				) : (
					<Redirect
						to={{
							pathname: NonAuthRoutes.login,
							state: { 
								message, 
								requestedPath: path
							}
						}}
					/>
				)
				
			}
		/>
	);
};