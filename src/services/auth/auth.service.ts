import { Configuration, createStandardPublicClientApplication, InteractionStatus, PublicClientApplication } from '@azure/msal-browser'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { useEffect, useState } from 'react';

export const msalConfig: Configuration = {
    auth: {
        clientId: 'c8f5d88b-c5d2-427e-9259-4daf0be50cc8',
        authority: 'https://login.microsoftonline.com/2c071350-5ae5-409d-8950-bed3b4a10c0b',
        redirectUri: 'https://eds.cwi.at/',
        postLogoutRedirectUri: '/logout'
    }
}
