import React, { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import * as SplashScreen from "expo-splash-screen";
import { supabase } from "../core/supabase";
import { AuthContext, AuthData } from "../contexts/AuthContext";
import { User, EmptyUser } from "../types";
import { authLogger } from "../utils/logger";
import { profileService } from "../services/profileService";
import { authService } from "../services";

SplashScreen.preventAutoHideAsync();

export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User>(EmptyUser);
	const [isLoading, setIsLoading] = useState(true);

	const loadUserProfile = async (userId: string): Promise<User> => {
		try {
			const profileUser = await profileService.get(userId);
			if (profileUser) {
				return profileUser;
			}

			authLogger.error("User profile not found, signing out");
			await authService.signOut();
			return EmptyUser;
		} catch (error) {
			authLogger.error("Error loading user profile:", error);
			await authService.signOut();
			return EmptyUser;
		}
	};

	const refreshUserProfile = async () => {
		if (session && session.user) {
			const updatedProfile = await loadUserProfile(session.user.id);
			setUser(updatedProfile);
		}
	};

	useEffect(() => {
		const getInitialSession = async () => {
			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					authLogger.error("Error getting initial session:", error);
				} else {
					setSession(session);
					if (session && session.user) {
						const userProfile = await loadUserProfile(session.user.id);
						setUser(userProfile);
					} else {
						setUser(EmptyUser);
					}
				}
			} catch (error) {
				authLogger.error("Error in getInitialSession:", error);
			} finally {
				setIsLoading(false);
				await SplashScreen.hideAsync();
			}
		};

		getInitialSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			authLogger.info("Auth state changed:", { event, hasSession: !!session });

			setSession(session);
			if (session?.user) {
				const userProfile = await loadUserProfile(session.user.id);
				setUser(userProfile);
			} else {
				setUser(EmptyUser);
			}
			setIsLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const authData: AuthData = {
		session,
		user,
		isLoading,
		isLoggedIn: !!session && !!user,
		refreshUser: refreshUserProfile,
	};

	return (
		<AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
	);
}
