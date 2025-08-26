export function validateExperience(arr) {
    return Array.isArray(arr) && arr.every(p =>
	typeof p.org == "string" &&
	typeof p.role == "string" &&
	typeof p.location == "string" &&
	typeof p.period == "string" &&
	Array.isArray(p.bullets)
    );
}
