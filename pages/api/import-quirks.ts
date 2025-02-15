import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {

    const response = await fetch('https://adobe-rtcdp-mock.vercel.app/data/core/ups/audiences?limit=100&start=1')
    const data = await response.json();

    const audiences = data.children?.filter((audience: any) => audience.name.includes(' Edge ')).map((audience: any) => {
        return {
            value: audience.id,
            name: audience.name,
        }
    })

    const quirksUpdateResponse = await fetch('https://uniform.app/api/v2/quirk', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.UNIFORM_API_KEY
        },
        body: JSON.stringify({
            "quirk": {
                "id": "segments",
                "name": "Segments",
                "description": "Adobe Audience Manager Segments",
                "options": audiences,
                "source": {
                    "name": "Adobe Audience Manager",
                    "id": "aam"
                }
            },
            "projectId": process.env.UNIFORM_PROJECT_ID
        })
    })

    if (!quirksUpdateResponse.ok) {
        res.status(500).json({ message: 'Failed to update quirks' })
        return;
    }

    res.status(200).json({ "message": "quirks updated" });
}