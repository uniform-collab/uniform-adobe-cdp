import { parse } from "cookie";

export async function getSegmentIds(cookie: string) {
    const ADOBE_ID_COOKIE_NAME = "AMCV_67A50FC0539F0BBD0A490D45%40AdobeOrg";
    const adobeIdCookieValue = parse(cookie || "")?.[
        ADOBE_ID_COOKIE_NAME
    ];
    if (!adobeIdCookieValue) {
        return [];
    }

    // TODO: review this way of parsing the visitorId
    // I am assuming that the visitorId is the 4th value in the cookie string
    // 179643557|MCIDTS|20134|MCMID|31126393343345682562734580966535580520|MCAAMLH-1740150942|9|MCAAMB-1740150942|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1739553342s|NONE|MCAID|NONE|vVersion|5.5.0
    const visitorId = adobeIdCookieValue.split("|")[4];

    // TODO: replace host with the actual host
    const datastreamId = "b773cd78-e6e5-4b21-bd0b-0d242c8d499b";
    const host = `https://adobe-rtcdp-mock.vercel.app`;
    const response = await fetch(
        `${host}/ee/v2/interact?datastreamId=${datastreamId}`,
        {
            method: "POST",
            body: JSON.stringify({
                event: {
                    xdm: {
                        identityMap: {
                            ECID: [
                                {
                                    id: visitorId,
                                    primary: true,
                                },
                            ],
                        },
                    },
                },
            }),
        }
    );

    if (!response.ok) {
        console.error(response);
    }

    const profileData = await response.json();
    const segmentIds = parseProfileData(profileData);
    return segmentIds;
}


export function parseProfileData(data: RequestData): string[] {
    const segmentIds: string[] = [];

    // Loop through each handle item
    data.handle.forEach((handleItem) => {
        // For each payload in the handle item
        handleItem.payload.forEach((payload) => {
            // Check if segments exist and are an array
            if (Array.isArray(payload.segments)) {
                payload.segments.forEach((segment) => {
                    if (segment.id) {
                        segmentIds.push(segment.id);
                    }
                });
            }
        });
    });

    return segmentIds;
}


// Define interfaces for type safety
interface Segment {
    id: string;
    namespace: string;
}

interface Payload {
    type: string;
    destinationId: string;
    alias: string;
    segments: Segment[];
}

interface HandleItem {
    payload: Payload[];
    type: string;
    eventIndex: number;
}

interface RequestData {
    requestId: string;
    handle: HandleItem[];
}
