(() => {
  'use strict';

  const T = window.THREE;
  if (!T) {
    window.FFU3D = { isSupported: () => false };
    return;
  }

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

  function isSupported() {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  function color(value, fallback) {
    try { return new T.Color(value || fallback); }
    catch { return new T.Color(fallback); }
  }

  function createPitchTexture(quality) {
    const canvas = document.createElement('canvas');
    const scale = quality === 'high' ? 2 : 1;
    canvas.width = 1024 * scale;
    canvas.height = 660 * scale;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#176534';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,.035)';
      ctx.fillRect((i * w) / 10, 0, w / 10, h);
    }

    const sx = w / 105;
    const sy = h / 68;
    const x = m => m * sx;
    const y = m => m * sy;
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = 2.4 * scale;
    ctx.strokeRect(x(1), y(1), x(103), y(66));
    ctx.beginPath();
    ctx.moveTo(x(52.5), y(1));
    ctx.lineTo(x(52.5), y(67));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x(52.5), y(34), x(9.15), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.beginPath();
    ctx.arc(x(52.5), y(34), 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeRect(x(1), y(13.84), x(16.5), y(40.32));
    ctx.strokeRect(x(87.5), y(13.84), x(16.5), y(40.32));
    ctx.strokeRect(x(1), y(24.84), x(5.5), y(18.32));
    ctx.strokeRect(x(98.5), y(24.84), x(5.5), y(18.32));
    ctx.beginPath();
    ctx.arc(x(11), y(34), 2.6 * scale, 0, Math.PI * 2);
    ctx.arc(x(94), y(34), 2.6 * scale, 0, Math.PI * 2);
    ctx.fill();

    const texture = new T.CanvasTexture(canvas);
    if ('colorSpace' in texture && T.SRGBColorSpace) texture.colorSpace = T.SRGBColorSpace;
    else if (T.sRGBEncoding) texture.encoding = T.sRGBEncoding;
    texture.anisotropy = quality === 'high' ? 4 : 1;
    return texture;
  }

  function numberSprite(number) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(3,10,7,.72)';
    ctx.beginPath();
    ctx.roundRect(18, 6, 92, 52, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.65)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '900 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), 64, 33);
    const texture = new T.CanvasTexture(canvas);
    if ('colorSpace' in texture && T.SRGBColorSpace) texture.colorSpace = T.SRGBColorSpace;
    else if (T.sRGBEncoding) texture.encoding = T.sRGBEncoding;
    const material = new T.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new T.Sprite(material);
    sprite.scale.set(2.3, 1.15, 1);
    sprite.position.set(0, 3.65, 0);
    sprite.userData.texture = texture;
    return sprite;
  }

  class MatchScene {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.options = options;
      this.quality = options.quality || 'low';
      this.cameraMode = options.camera || 'broadcast';
      this.reducedMotion = Boolean(options.reducedMotion);
      this.destroyed = false;
      this.lastBall = { x: 0, z: 0 };
      this.event = null;
      this.clock = new T.Clock();
      this.playerMeshes = [];
      this.disposables = [];
      this.resizeObserver = null;

      this.renderer = new T.WebGLRenderer({
        canvas,
        antialias: this.quality !== 'low',
        alpha: false,
        powerPreference: this.quality === 'high' ? 'high-performance' : 'default',
        preserveDrawingBuffer: false
      });
      if ('outputColorSpace' in this.renderer && T.SRGBColorSpace) this.renderer.outputColorSpace = T.SRGBColorSpace;
      else if (T.sRGBEncoding) this.renderer.outputEncoding = T.sRGBEncoding;
      this.renderer.toneMapping = T.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.03;
      this.renderer.setClearColor(0x050b08, 1);

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x07110c);
      this.scene.fog = new T.Fog(0x07110c, 78, 145);
      this.camera = new T.PerspectiveCamera(42, 16 / 9, 0.1, 260);
      this.camera.position.set(4, 47, 61);
      this.cameraTarget = new T.Vector3(0, 0, 0);

      this.buildEnvironment();
      this.buildPlayers();
      this.resize();

      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas);
      }
    }

    track(resource) {
      this.disposables.push(resource);
      return resource;
    }

    material(params) {
      if (this.quality === 'low') {
        const basic = { ...params };
        delete basic.roughness;
        delete basic.metalness;
        return this.track(new T.MeshLambertMaterial(basic));
      }
      return this.track(new T.MeshStandardMaterial(params));
    }

    buildEnvironment() {
      const ambient = new T.HemisphereLight(0xd8ffe2, 0x17361f, 1.55);
      this.scene.add(ambient);
      const key = new T.DirectionalLight(0xffffff, 1.9);
      key.position.set(-24, 54, 28);
      this.scene.add(key);
      const rim = new T.DirectionalLight(0x8bd5ff, 0.65);
      rim.position.set(35, 22, -35);
      this.scene.add(rim);

      const pitchGeometry = this.track(new T.PlaneGeometry(105, 68));
      const pitchTexture = this.track(createPitchTexture(this.quality));
      const pitchMaterial = this.track(new T.MeshStandardMaterial({ map: pitchTexture, roughness: 0.92, metalness: 0 }));
      const pitch = new T.Mesh(pitchGeometry, pitchMaterial);
      pitch.rotation.x = -Math.PI / 2;
      pitch.position.y = 0;
      this.scene.add(pitch);

      const apronGeometry = this.track(new T.PlaneGeometry(132, 92));
      const apronMaterial = this.material({ color: 0x0b2818, roughness: 1 });
      const apron = new T.Mesh(apronGeometry, apronMaterial);
      apron.rotation.x = -Math.PI / 2;
      apron.position.y = -0.035;
      this.scene.add(apron);

      this.buildGoals();
      this.buildStadium();

      const ballGeometry = this.track(new T.SphereGeometry(0.42, this.quality === 'low' ? 8 : 14, this.quality === 'low' ? 6 : 10));
      const ballMaterial = this.material({ color: 0xf8fafc, roughness: 0.55, metalness: 0.02 });
      this.ball = new T.Mesh(ballGeometry, ballMaterial);
      this.ball.position.set(0, 0.48, 0);
      this.scene.add(this.ball);

      const spotGeometry = this.track(new T.CircleGeometry(0.66, 20));
      const spotMaterial = this.track(new T.MeshBasicMaterial({ color: 0x020503, transparent: true, opacity: 0.34, depthWrite: false }));
      this.ballShadow = new T.Mesh(spotGeometry, spotMaterial);
      this.ballShadow.rotation.x = -Math.PI / 2;
      this.ballShadow.position.y = 0.025;
      this.scene.add(this.ballShadow);
    }

    buildGoals() {
      const postGeometry = this.track(new T.CylinderGeometry(0.08, 0.08, 2.5, 8));
      const crossGeometry = this.track(new T.CylinderGeometry(0.08, 0.08, 7.32, 8));
      const postMaterial = this.material({ color: 0xf8fafc, roughness: 0.5 });
      const netMaterial = this.track(new T.MeshBasicMaterial({ color: 0xcdeed7, wireframe: true, transparent: true, opacity: 0.28 }));
      const netGeometry = this.track(new T.BoxGeometry(2.4, 2.45, 7.2, 2, 2, 4));

      [-1, 1].forEach(side => {
        const group = new T.Group();
        const x = side * 52.5;
        [-3.66, 3.66].forEach(z => {
          const post = new T.Mesh(postGeometry, postMaterial);
          post.position.set(x, 1.25, z);
          group.add(post);
        });
        const bar = new T.Mesh(crossGeometry, postMaterial);
        bar.rotation.x = Math.PI / 2;
        bar.position.set(x, 2.5, 0);
        group.add(bar);
        const net = new T.Mesh(netGeometry, netMaterial);
        net.position.set(x + side * 1.15, 1.22, 0);
        group.add(net);
        this.scene.add(group);
      });
    }

    buildStadium() {
      const standMaterial = this.material({ color: 0x101d17, roughness: 0.95 });
      const crowdMaterials = [
        this.material({ color: 0x274d34, roughness: 1 }),
        this.material({ color: 0x7b2430, roughness: 1 }),
        this.material({ color: 0x184a65, roughness: 1 }),
        this.material({ color: 0xb99532, roughness: 1 })
      ];

      const stands = [
        [0, 4.5, -43, 118, 9, 14],
        [0, 4.5, 43, 118, 9, 14],
        [-65, 4.5, 0, 18, 9, 76],
        [65, 4.5, 0, 18, 9, 76]
      ];
      stands.forEach((s, idx) => {
        const geo = this.track(new T.BoxGeometry(s[3], s[4], s[5]));
        const mesh = new T.Mesh(geo, standMaterial);
        mesh.position.set(s[0], s[1], s[2]);
        this.scene.add(mesh);
        const rows = this.quality === 'low' ? 2 : 4;
        for (let r = 0; r < rows; r++) {
          const crowdGeo = this.track(new T.BoxGeometry(
            idx < 2 ? 108 : 2.2,
            0.52,
            idx < 2 ? 1.45 : 66
          ));
          const crowd = new T.Mesh(crowdGeo, crowdMaterials[(idx + r) % crowdMaterials.length]);
          crowd.position.set(
            s[0],
            2 + r * 1.45,
            s[2] + (idx === 0 ? 5.4 + r * 1.6 : idx === 1 ? -5.4 - r * 1.6 : 0)
          );
          if (idx > 1) crowd.position.x = s[0] + (idx === 2 ? 5.3 + r * 1.6 : -5.3 - r * 1.6);
          this.scene.add(crowd);
        }
      });

      const boardGeoLong = this.track(new T.BoxGeometry(106, 1.05, 0.35));
      const boardGeoShort = this.track(new T.BoxGeometry(0.35, 1.05, 69));
      const boardMat = this.track(new T.MeshBasicMaterial({ color: 0x22c55e }));
      [[0, 0.55, -35], [0, 0.55, 35]].forEach(p => {
        const b = new T.Mesh(boardGeoLong, boardMat);
        b.position.set(...p);
        this.scene.add(b);
      });
      [[-53.6, 0.55, 0], [53.6, 0.55, 0]].forEach(p => {
        const b = new T.Mesh(boardGeoShort, boardMat);
        b.position.set(...p);
        this.scene.add(b);
      });
    }

    buildPlayers() {
      const teamColors = [
        color(this.options.homeColor, '#ef4444'),
        color(this.options.awayColor, '#38bdf8')
      ];
      const skinPalette = [0xc98d63, 0x8b5e3b, 0xe0aa7a, 0x6e442d, 0xb97850];
      const torsoGeo = this.track(new T.CylinderGeometry(0.48, 0.64, 1.28, 7));
      const shortsGeo = this.track(new T.BoxGeometry(1.02, 0.5, 0.72));
      const limbGeo = this.track(new T.CylinderGeometry(0.13, 0.16, 1.05, 6));
      const headGeo = this.track(new T.SphereGeometry(0.38, this.quality === 'low' ? 8 : 12, this.quality === 'low' ? 6 : 8));
      const eyeGeo = this.track(new T.SphereGeometry(0.035, 5, 4));
      const shadowGeo = this.track(new T.CircleGeometry(0.68, 16));
      const shadowMat = this.track(new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.27, depthWrite: false }));
      const eyeMat = this.track(new T.MeshBasicMaterial({ color: 0x15110e }));

      for (let team = 0; team < 2; team++) {
        const kitMat = this.material({ color: teamColors[team], roughness: 0.72 });
        const shortsMat = this.material({ color: teamColors[team].clone().multiplyScalar(0.55), roughness: 0.78 });
        for (let i = 0; i < 11; i++) {
          const group = new T.Group();
          const skinMat = this.material({ color: skinPalette[(i + team * 2) % skinPalette.length], roughness: 0.84 });
          const hairMat = this.material({ color: i % 4 === 0 ? 0x3b2417 : 0x181818, roughness: 0.95 });

          const torso = new T.Mesh(torsoGeo, kitMat);
          torso.position.y = 1.65;
          group.add(torso);

          const shorts = new T.Mesh(shortsGeo, shortsMat);
          shorts.position.y = 0.86;
          group.add(shorts);

          const head = new T.Mesh(headGeo, skinMat);
          head.position.set(0, 2.58, 0);
          group.add(head);
          const hair = new T.Mesh(headGeo, hairMat);
          hair.scale.set(1.02, 0.48, 1.02);
          hair.position.set(0, 2.78, 0);
          group.add(hair);

          [-0.12, 0.12].forEach(z => {
            const eye = new T.Mesh(eyeGeo, eyeMat);
            eye.position.set(0.34, 2.63, z);
            group.add(eye);
          });

          const leftArm = new T.Mesh(limbGeo, kitMat);
          const rightArm = new T.Mesh(limbGeo, kitMat);
          leftArm.position.set(0, 1.52, -0.65);
          rightArm.position.set(0, 1.52, 0.65);
          group.add(leftArm, rightArm);

          const leftLeg = new T.Mesh(limbGeo, skinMat);
          const rightLeg = new T.Mesh(limbGeo, skinMat);
          leftLeg.position.set(0, 0.33, -0.27);
          rightLeg.position.set(0, 0.33, 0.27);
          group.add(leftLeg, rightLeg);

          const shadow = new T.Mesh(shadowGeo, shadowMat);
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.y = 0.025;
          group.add(shadow);

          const sprite = numberSprite(i + 1);
          group.add(sprite);
          this.scene.add(group);
          this.playerMeshes.push({ group, leftArm, rightArm, leftLeg, rightLeg, sprite, lastX: 0, lastZ: 0, phase: i * 0.7 + team });
        }
      }
    }

    setQuality(quality) {
      this.quality = quality || 'medium';
      this.resize();
    }

    setCamera(mode) {
      this.cameraMode = mode || 'broadcast';
    }

    setReducedMotion(value) {
      this.reducedMotion = Boolean(value);
    }

    resize() {
      if (this.destroyed) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(320, Math.round(rect.width || 960));
      const height = Math.max(180, Math.round(width * 9 / 16));
      const qualityScale = this.quality === 'low' ? 0.72 : this.quality === 'high' ? 1.18 : 0.92;
      const pixelRatio = clamp((window.devicePixelRatio || 1) * qualityScale, 0.7, this.quality === 'high' ? 1.65 : 1.25);
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    playEvent(type, team) {
      const now = performance.now();
      const direction = team === 0 ? 1 : -1;
      const duration = type === 'goal' ? 1850 : type === 'shot' ? 1050 : 900;
      this.event = {
        type,
        team,
        direction,
        start: now,
        duration,
        from: { ...this.lastBall },
        to: {
          x: direction * 52.2,
          z: clamp(this.lastBall.z * 0.45 + (Math.random() - 0.5) * 5, -3.2, 3.2)
        }
      };
    }

    updateCamera(ballX, ballZ, time) {
      const event = this.event;
      let targetX = ballX * 0.52;
      let targetZ = ballZ * 0.28;
      let x = ballX * 0.17;
      let y = 47;
      let z = 60;

      if (this.cameraMode === 'sideline') {
        x = ballX * 0.32;
        y = 28;
        z = 45;
        targetX = ballX * 0.75;
        targetZ = ballZ * 0.5;
      } else if (this.cameraMode === 'follow') {
        x = ballX - 18;
        y = 16;
        z = ballZ + 25;
        targetX = ballX + 5;
        targetZ = ballZ;
      }

      if (event && event.type === 'goal') {
        const progress = clamp((time - event.start) / event.duration, 0, 1);
        x = lerp(x, event.direction * 39, ease(progress));
        y = lerp(y, 17, ease(progress));
        z = lerp(z, event.to.z + 18, ease(progress));
        targetX = event.direction * 51;
        targetZ = event.to.z;
        if (!this.reducedMotion) {
          x += Math.sin(time * 0.034) * (1 - progress) * 0.5;
          y += Math.cos(time * 0.041) * (1 - progress) * 0.24;
        }
      }

      const smooth = this.reducedMotion ? 0.18 : 0.075;
      this.camera.position.x = lerp(this.camera.position.x, x, smooth);
      this.camera.position.y = lerp(this.camera.position.y, y, smooth);
      this.camera.position.z = lerp(this.camera.position.z, z, smooth);
      this.cameraTarget.x = lerp(this.cameraTarget.x, targetX, smooth * 1.35);
      this.cameraTarget.y = lerp(this.cameraTarget.y, 0.75, smooth);
      this.cameraTarget.z = lerp(this.cameraTarget.z, targetZ, smooth * 1.35);
      this.camera.lookAt(this.cameraTarget);
    }

    render(players, ball, time = performance.now()) {
      if (this.destroyed) return;
      const dt = Math.min(0.05, this.clock.getDelta() || 0.016);

      players.forEach((p, index) => {
        const mesh = this.playerMeshes[index];
        if (!mesh) return;
        const worldX = (p.x - 0.5) * 105;
        const worldZ = (p.y - 0.5) * 68;
        const dx = worldX - mesh.lastX;
        const dz = worldZ - mesh.lastZ;
        const speed = clamp(Math.hypot(dx, dz) / Math.max(dt, 0.01), 0, 20);
        mesh.group.position.x = worldX;
        mesh.group.position.z = worldZ;
        mesh.group.position.y = 0;
        if (Math.abs(dx) + Math.abs(dz) > 0.002) {
          const yaw = Math.atan2(-dz, dx);
          mesh.group.rotation.y = lerp(mesh.group.rotation.y, yaw, 0.14);
        }
        const stride = this.reducedMotion ? 0.08 : Math.sin(time * 0.012 + mesh.phase) * clamp(speed / 13, 0.04, 0.75);
        mesh.leftArm.rotation.z = stride * 0.65;
        mesh.rightArm.rotation.z = -stride * 0.65;
        mesh.leftLeg.rotation.z = -stride * 0.55;
        mesh.rightLeg.rotation.z = stride * 0.55;
        mesh.group.position.y = Math.abs(stride) * 0.035;
        mesh.lastX = worldX;
        mesh.lastZ = worldZ;
      });

      let ballX = (ball.x - 0.5) * 105;
      let ballZ = (ball.y - 0.5) * 68;
      let ballY = 0.48;
      if (this.event) {
        const p = clamp((time - this.event.start) / this.event.duration, 0, 1);
        const e = ease(p);
        ballX = lerp(this.event.from.x, this.event.to.x, e);
        ballZ = lerp(this.event.from.z, this.event.to.z, e);
        ballY = 0.48 + Math.sin(Math.PI * p) * (this.event.type === 'goal' ? 4.8 : 3.2);
        if (p >= 1) this.event = null;
      }
      this.lastBall.x = ballX;
      this.lastBall.z = ballZ;
      this.ball.position.set(ballX, ballY, ballZ);
      this.ball.rotation.x += dt * 8;
      this.ball.rotation.z += dt * 6;
      this.ballShadow.position.set(ballX, 0.025, ballZ);
      const shadowScale = clamp(1 - (ballY - 0.48) * 0.1, 0.45, 1);
      this.ballShadow.scale.setScalar(shadowScale);

      this.updateCamera(ballX, ballZ, time);
      this.renderer.render(this.scene, this.camera);
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      this.resizeObserver?.disconnect();
      this.playerMeshes.forEach(p => {
        if (p.sprite?.material) p.sprite.material.dispose();
        if (p.sprite?.userData?.texture) p.sprite.userData.texture.dispose();
      });
      this.scene.traverse(obj => {
        if (obj.geometry && !this.disposables.includes(obj.geometry)) obj.geometry.dispose?.();
        if (obj.material && !this.disposables.includes(obj.material)) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(m => m.dispose?.());
        }
      });
      this.disposables.forEach(item => item?.dispose?.());
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
  }

  window.FFU3D = { isSupported, MatchScene };
})();
