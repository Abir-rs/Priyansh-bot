module.exports.config = {
    name: "rank",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "",
    description: "View Member Rankings",
    commandCategory: "Group",
    usages: " [user] or [tag]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "path": "",
        "jimp": "",
        "node-superfetch": "",
        "canvas": ""
    }
};

module.exports.makeRankCard = async (data) => {
    const fs = require("fs-extra");
    const path = require("path");
    const Canvas = require("canvas");
    const request = require("node-superfetch");
    const __root = path.resolve(__dirname, "cache");
    const PI = Math.PI;

    const { id, name, rank, level, expCurrent, expNextLevel } = data;

    // Register fonts
    Canvas.registerFont(path.join(__root, "regular-font.ttf"), { family: "Manrope", weight: "regular", style: "normal" });
    Canvas.registerFont(path.join(__root, "bold-font.ttf"), { family: "Manrope", weight: "bold", style: "normal" });

    let rankCardImagePath = path.resolve(__root, "rankcard.png");
    let customRankDir = path.resolve(__root, "customrank");
    let customDir = fs.readdirSync(customRankDir).map(item => item.replace(/\.png$/, ""));

    // Find the custom image based on the user's level
    for (const customFile of customDir) {
        const [minLevel, maxLevel] = customFile.split('-').map(Number);
        if (level >= minLevel && level <= (maxLevel || minLevel)) {
            rankCardImagePath = path.join(customRankDir, `${customFile}.png`);
            break;
        }
    }

    const rankCard = await Canvas.loadImage(rankCardImagePath);
    const avatar = await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    const avatarImage = await this.circle(avatar.body);

    const canvas = Canvas.createCanvas(1000, 282);
    const ctx = canvas.getContext("2d");

    // Create a vibrant gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#FF7F50"); // Coral
    gradient.addColorStop(0.5, "#FFD700"); // Gold
    gradient.addColorStop(1, "#00BFFF"); // Deep Sky Blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the rank card
    ctx.drawImage(rankCard, 0, 0, canvas.width, canvas.height);
    
    // Draw the avatar with a colorful border
    ctx.beginPath();
    ctx.arc(70 + 75, 75 + 75, 75, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#FF1493"; // Deep Pink border for the avatar
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.drawImage(await Canvas.loadImage(avatarImage), 70, 75, 150, 150);

    // Bright text styles
    ctx.font = `bold 36px Manrope`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "start";
    ctx.fillText(name, 270, 164);

    ctx.font = `42px Manrope`;
    ctx.fillStyle = "#32CD32"; // Lime Green for Level
    ctx.textAlign = "center";
    ctx.fillText(level, 934 - 68, 82);

    // Rank Text Styling
    ctx.font = `bold 39px Manrope`;
    ctx.fillStyle = "#FFD700"; // Gold for Rank
    ctx.textAlign = "end";
    ctx.fillText(`#${rank}`, 934 - 55 - ctx.measureText(level).width - 16 - ctx.measureText(`Lv.`).width - 25, 82);

    // Experience Styling
    ctx.font = `bold 40px Manrope`;
    ctx.fillStyle = "#00BFFF"; // Deep Sky Blue for Current Exp
    ctx.textAlign = "start";
    ctx.fillText(`/ ${expNextLevel}`, 710 + ctx.measureText(expCurrent).width + 10, 164);
    ctx.fillStyle = "#FF6347"; // Tomato for Current Exp
    ctx.fillText(expCurrent, 710, 164);

    // Progress Bar with colorful gradient
    const expWidth = Math.min((expCurrent * 610) / expNextLevel, 610 - 19.5);
    const progressBarGradient = ctx.createLinearGradient(0, 0, expWidth, 0);
    progressBarGradient.addColorStop(0, "#FF6347"); // Tomato color at start
    progressBarGradient.addColorStop(1, "#FF1493"); // Deep Pink at end
    ctx.beginPath();
    ctx.fillStyle = progressBarGradient;
    ctx.arc(257 + 18.5, 147.5 + 36.25, 18.5, 1.5 * PI, 0.5 * PI, true);
    ctx.fill();
    ctx.fillRect(257 + 18.5, 147.5 + 36.25, expWidth, 37.5);
    ctx.arc(257 + 18.5 + expWidth, 147.5 + 36.25, 18.75, 1.5 * PI, 0.5 * PI, false);
    ctx.fill();

    const imageBuffer = canvas.toBuffer();
    const pathImg = path.resolve(__root, `rank_${id}.png`);
    fs.writeFileSync(pathImg, imageBuffer);
    return pathImg;
};
