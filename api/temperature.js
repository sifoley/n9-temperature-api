export default async function handler(req, res) {
    res.status(200).json({
        temperature: "-21.8",
        humidity: "43",
        battery: "92"
    });
}
