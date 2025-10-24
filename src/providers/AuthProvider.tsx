import React, { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import * as SplashScreen from "expo-splash-screen";
import { supabase } from "../core/supabase";
import { AuthContext, AuthData } from "../contexts/AuthContext";
import { Profile, EmptyProfile } from "../types";
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
	const [profile, setProfile] = useState<Profile>(EmptyProfile);
	const [isLoading, setIsLoading] = useState(true);

	const loadProfile = async (profileId: string): Promise<Profile> => {
		try {
			const profileData = await profileService.get(profileId);
			if (profileData) {
				return profileData;
			}

			authLogger.error("Profile not found, signing out");
			await authService.signOut();
			return EmptyProfile;
		} catch (error) {
			authLogger.error("Error loading profile:", error);
			await authService.signOut();
			return EmptyProfile;
		}
	};

	const refreshProfile = async () => {
		if (session && session.user) {
			const updatedProfile = await loadProfile(session.user.id);
			setProfile(updatedProfile);
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
						const profile = await loadProfile(session.user.id);
						setProfile(profile);
					} else {
						setProfile(EmptyProfile);
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
				const profile = await loadProfile(session.user.id);
				setProfile(profile);
			} else {
				setProfile(EmptyProfile);
			}
			setIsLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const authData: AuthData = {
		session,
		profile,
		isLoading,
		isLoggedIn: !!session && !!profile,
		refreshProfile,
	};

	return (
		<AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
	);
}
