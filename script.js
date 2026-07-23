// ================= MAP =================

const map = L.map("map", {
    zoomControl: true
}).setView([0, 0], 3);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap Contributors"
}).addTo(map);

// ================= ISS ICON =================

const issIcon = L.icon({
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg",
    iconSize: [55,55],
    iconAnchor: [27,27]
});

const marker = L.marker([0,0],{
    icon:issIcon
}).addTo(map);

// ================= ORBIT PATH =================

let orbitPath=[];

const orbitLine=L.polyline([],{
    color:"#00ffff",
    weight:3,
    opacity:0.75
}).addTo(map);

// ================= UPDATE FUNCTION =================

async function updateISS(){

    try{

        // ISS DATA
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");

        if(!res.ok) throw new Error("ISS API Error");

        const data = await res.json();

        const lat = Number(data.latitude);
        const lon = Number(data.longitude);

        // UPDATE INFO

        document.getElementById("latitude").textContent =
        lat.toFixed(4)+"°";

        document.getElementById("longitude").textContent =
        lon.toFixed(4)+"°";

        document.getElementById("altitude").textContent =
        data.altitude.toFixed(2)+" km";

        document.getElementById("velocity").textContent =
        Math.round(data.velocity)+" km/h";

        // MOVE MARKER

        marker.setLatLng([lat,lon]);

        map.panTo([lat,lon],{
            animate:true,
            duration:1.5
        });

        // ORBIT LINE

        orbitPath.push([lat,lon]);

        if(orbitPath.length>200){

            orbitPath.shift();

        }

        orbitLine.setLatLngs(orbitPath);

        // UPDATE TIME

        document.getElementById("updateTime").textContent =
        "Updated : "+new Date().toLocaleTimeString();

        // ================= COUNTRY =================

        try{

            const geo = await fetch(

            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`

            );

            if(geo.ok){

                const place = await geo.json();

                document.getElementById("country").textContent =
                place.address?.country || "🌊 Ocean";

                document.getElementById("region").textContent =
                place.display_name || "";

            }
            else{

                document.getElementById("country").textContent =
                "🌊 Ocean";

                document.getElementById("region").textContent = "";

            }

        }

        catch{

            document.getElementById("country").textContent =
            "🌊 Ocean";

            document.getElementById("region").textContent = "";

        }

    }

    catch(err){

        console.error(err);

        document.getElementById("country").textContent="Connection Error";

        document.getElementById("region").textContent="";

    }

}

// ================= START =================

updateISS();

setInterval(updateISS,5000);