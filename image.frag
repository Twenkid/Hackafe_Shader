/*
  ["Hackafe Logo"] Exercise #1. Version: 27.12.2017
  https://www.shadertoy.com/view/4lffzf

  [Author]: Todor "Tosh" Arnaudov (Twenkid) http://artificial-mind.blogspot.bg | http://research.twenkid.com
  [Credits and Thanks]: Shadertoy community, iq, Dave Hoskins, rear, LeGuignon; BigWings; Phong; CG pioneers and mathematicians from the past 
                        "Hackafe" existed in Plovdiv, Bulgaria. Currently it's hibernated: http://www.hackafe.org/                 
  [Story]

  Hackafe - "The Plovdiv's Hackerspace" - was established in 2013 A.D. with love and enthusiasm.
  It had a youth of passion and sailed in an ocean of expectations, but the Water happened to be
  too deep and stormy, thus the cruise was quite short.
  The sailors and captains weren't strong enough to sustain...
  Their relationships and activities became increasingly dysfunctional.
  The atmosphere went worse and worse, and the hackerspace irreversibly declined
  to its shameful oblivion and death.

  After a long painful agony the last survivors put Hackafe to sleep in October 2017.
  
  A few genes lasted, though. They were launched deep into the Cyberspace 
  to find a better planet where to bloom and live again...   

  [Future work:]

      1. Antialiasing and motion blur
      2. More spatial artifacts in the background (specfic stars/larger variety of brightness/color, comets, planets, black hole, asteroids flying)
      3. Cloud/fog
      4. Icy/semi-transparent "bumpy" blocks (like for example the IcePrimitives shader) to exercise refraction, subsurface scattering
      5. More freedom for the blocks - more rotations, phsysics, bouncing; interactivity through the mouse, hitting by asteroids, laser beams
      6. Electricity arcs around the blocks, lightning strikes
      7. Raining lava?, blocks reacting to the hits - heating/cooling ...
      8. More complex and varying sound
      9. More complex lighting, Fresnel equations, shadows, ...
      10. Story, travelling, scene changes, action
                        
*/

float z = 0.05;
float StepDiv = 35.;
float StepBase = 0.30; //Blocks
const float cube = 3.; //(~) distance to distinguish the cube from space
float step = 0.8; //Blocks
const vec2 cameraYz = vec2(2.65,-5.5); //the X is animated
float cameraSpeed = 2.4; //2.7;

const int STEPS = 50; //ray marching steps
const float EPS = 0.001; //precision (epsilon)

// from iq's "Anels", from Kali's Lonely Tree shader, from Analytical geometry textbooks - rotation around axis
mat3 rotationMat(in vec3 v, in float angle) //, in out vec3 vOut)
{
    float c = cos(angle), s = sin(angle);
    return mat3(c + (1.0 - c) * v.x * v.x, 
                (1.0 - c) * v.x * v.y - s * v.z,
                (1.0 - c) * v.x * v.z + s * v.y,
                
                (1.0 - c) * v.x * v.y + s * v.z,
                c + (1.0 - c) * v.y * v.y,
                (1.0 - c) * v.y * v.z - s * v.x,
                
                (1.0 - c) * v.x * v.z - s * v.y,
                (1.0 - c) * v.y * v.z + s * v.x,
                c + (1.0 - c) * v.z * v.z);
}

// jerome, Electricity
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm8(vec2 n) {
    float total = 0.0, amplitude = 1.0;
    for (int i = 0; i < 8; i++) {
        total += noise(n)/2. * amplitude;
        n += n;
        amplitude *= 0.5;
    }
    return total;
}

//Based on Electricity, but modified by Twenkid to look somewhat like a burst of hot gas.
//Should be optimized and varied - e.g. arrays and cycles/more streams/more adjustible
vec3 electricity(vec2 uv ){    
   vec2 t = uv * vec2(2.0,1.0) - iTime*4.0;      
   float ybase = 0.30, ystep = 0.03;
   float ycenter = ybase+fbm8(t)*0.35;
    
   float ycenter2 = ybase+ystep+fbm8(t)*0.5;
   float ycenter3 = ybase-ystep+fbm8(t)*0.5;    
   float diff = abs(uv.y - ycenter);
   float c1 = 1.0 - mix(0.0,0.3,diff*21.0);
     
    c1 = clamp(c1, 0., 1.);
    vec3 col = vec3(c1*0.9, 0.9*c1,c1*0.2);
        
    float diff2 = abs(uv.y - ycenter2);
    float c2 = 1.0 - mix(0.0,0.2,diff2*21.0);    
    col = mix(col, vec3(c2*0.7, 0.4*c2, c2*0.1), 0.7);
    
    float d3 = abs(uv.y - ycenter3);
    float c3 = 1.0 - mix(0.0,0.3,diff2*21.0);
    col = mix(col, vec3(c3*0.5, 0.3*c3, c3*0.1), 0.5);
    //col = mix(col, vec3(c3*0.7+abs(noise(uv)/5.), 0.3*c3, c3*0.1), 0.5); //noise - no, too jaggy
   // col = min(col, vec3(c3*0.7+abs(fbm8(uv)/5.), 0.3*c3, c3*0.1));
    col = max(vec3(0.), col); //avoid negative color - electricity is multiplied in the render
    return col;
}
// jerome's end

//// Dave Hoskins's? noise
float N1(float t) { return fract(sin(t*10234.324)*123423.23512);  }

vec2 N22(vec2 p)
{	// Dave Hoskins - https://www.shadertoy.com/view/4djSRW   //modified to vec2, vec2
	vec2 p2  = fract(vec2(p.xyx) * vec2(443.897, 441.423)); // 437.195));
    p2 += dot(p2, p2.yx + 19.19);
    return fract(vec2((p2.x + p2.y)*p2.x, (p2.y+p2.y)*p2.x));
}

vec2 fbm(vec2 v){ return N22(v)*0.5 + vec2(0.25*N1(v.x)) + vec2(0.25*N1(v.y)); }

//iq's box
float sdBox( vec3 p, vec3 b ) { // float zoom = 3.;   
    vec3 d = (abs(p) - b);
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}
//float sdPlane(vec3 p){return p.y;} //future use - grid plane?

float distLimitBorder(vec3 r){ //26-12-2017
   //float step = StepBase + sin(iTime)/STEPDIV;
   //float d3 = sdBox(r-vec3(1.0,0.25, 0.0), vec3(0.1, 0.1, z));
   //return d3;
    
   vec3 axis = normalize(vec3(1.0, 0.25, 0.0));  
   r*= rotationMat(axis, mod(fract(iTime)*6.28, 6.28));    
   float d1 = sdBox(r-vec3( 1.0,0.25, 0.0), vec3(0.1, 0.1, z));  
   return d1;    
}  
/*
float distLimitBig(vec3 r){ //26-12-2017 - right border/curtain
   float step = StepBase+ sin(iTime)/StepDiv;
   float d3 = sdBox(r-vec3(10.0,StepBase, 0.0), vec3(9., 10., z));
   return d3;
}
*/
  
//Distance from the objects. Should be optimized, could use one or a few common formulas,
//except for the rotating block.
float dist(vec3 r)
{      
   float step = StepBase + sin(iTime)/StepDiv;           
    vec3 axis = normalize(vec3(1.0, 0.25, 0.0));     
    vec3 r1 = r * rotationMat(axis, mod(fract(iTime)*6.28, 6.28));    
    float d1 = sdBox(r1-vec3( 1.0,0.25, 0.0), vec3(0.1, 0.1, z));  
    
    float d2 = sdBox(r-vec3(1.0-step,0.25, 0.0), vec3(0.1, 0.1, z));
    float d3 = sdBox(r-vec3(1.0-step-step,0.25, 0.0), vec3(0.1, 0.1, z));
        
    float d4 = sdBox(r-vec3(1.0,0.25+step, 0.0), vec3(0.1, 0.1, z));
    float d5 = sdBox(r-vec3(1.0-step,0.25+step, 0.0), vec3(0.1, 0.1, z));
    float d6 = sdBox(r-vec3(1.0-step-step,0.25+step, 0.0), vec3(0.1, 0.1, z));
    
    float d7 = sdBox(r-vec3(1.0,0.25-step, 0.0), vec3(0.1, 0.1, z));   
    float d8 = sdBox(r-vec3(1.0-step-step,0.25-step, 0.0), vec3(0.1, 0.1, z));
    
    float d = min(d1,d2);
    d = min(d, min(d3,d4));
    d = min(d, min(d5,d6));
    d = min(d, min(d7,d8));       
    return d;
}

// Normal vector - http://www.pouet.net/topic.php?which=7920&page=10 by rear
vec3 normal(vec3 p)
{
	#define dr 1e-5
	vec3 drx = vec3(dr,0,0);
	vec3 dry = vec3(0,dr,0);
	vec3 drz = vec3(0,0,dr);
	return ( vec3( dist(p+drx), dist(p+dry), dist(p+drz) ) - dist(p)) / dr;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{        
	vec2 uv = fragCoord.xy / iResolution.xy;
    fragColor = vec4(0.);    
    vec2 r = (fragCoord.xy / iResolution.xy);
	r.x*=(iResolution.x/iResolution.y);	           
    r -=vec2(0.1, 0.8);    		    
    vec3 camera = vec3(1.05+(sin(iTime))*cameraSpeed,cameraYz); //more to the center      	
    vec3 ro =  vec3(r.x, r.y+1.0, -1.0);       
    vec3 p = ro;  //ray origin          
	vec3 dir = normalize(p-camera); //ray direction
    float d; //distance
    
	for(int i=0; i<STEPS; i++) //Ray marching
	{
		d = dist(p);
		if(d < EPS) break;
		p = p+dir*d;
	}

    vec3 materialcolor=vec3(0.);        
    int m;  
    if (d<=cube) { m = 0; materialcolor = vec3(0.9,.9,.2);} //cube;
    else { m = 1; } //materialcolor = vec3(0.);}
            
	vec3 nor = normal(p);  // normal vector
    vec3 lightpos = vec3(1.5-sin(iTime)*5., 0.1+sin(iTime), 3.5+sin(iTime)*5.);           
    lightpos.y +=sin(iTime); // [-1., +1]
         
    vec3 lightdir = normalize(vec3(0.3,0.3,0.3)-lightpos);
   	
    float light = 1.0 + 0.01*(dot(nor,lightpos)); //intensity
    
    light *=  pow(dist(lightdir-p), 2.);
    
	//vec3 color = vec3(light);
    vec3 color = vec3(1.0-light/5.); //vec3(1.0, 1.0, 1.0);
    color = clamp( materialcolor*color, 0., 1.0);
    
    //Phong
    float dif = clamp( dot( nor, lightdir ), 0.0, 1.0 ); //iq diffuse
    vec3  ref = reflect( dir, nor );  //reflection
    float spe = pow(clamp( dot( ref, lightdir ), 0.0, 1.0 ),16.0); //specular component
        
    color+=dif/3. + spe/2.;
        
	fragColor = vec4(color, 1.0);
    fragColor.xyz = vec3(color);
    fragColor.w = m ==0 ? 1. : 0.; //
             
    vec2 pos = 2.0 * vec2(fragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    
   //The space, stars... #28-11-2017 & electricity
   if ( fragColor.r < 0.001 && m==1)
    {     
        //To do: add more effects: specific stars, nebullas, planets, comets, black hole etc.... had meteors, but were removed;    
        vec2 n1 = N22(pos);
        float star = n1.x < 0.07 ? 0.1 : 0.;        
        star+= n1.y > 0.97 ? N1(n1.x)/1.0*(max(star, sin(iTime))) : 0.0;
        vec2 fb = fbm(pos);
        star*=max(fb.x, fb.y);       
        fragColor += star*1.4; //brighter stars
        fragColor.a = 1.0;                                 
        fragColor.xyzw+=vec4(clamp(abs(cos(iTime/3.5))*4.28, 1., 3.)*electricity(uv), 1.0); //thick line        
    }
    else //The blocks
    {     
     const float EPSLIMIT = EPS*5.; //0.06;
     float limit = 0.0;     
     ro =  vec3(r.x, r.y+1.0, -1.0);    
     p = ro;
	 dir = normalize(p-camera);                     
	 for(int i=0; i<STEPS/3; i++)  //Second marching for the rotating block and the burst. Fewer steps and lower precision are enough.
	 {
        d = distLimitBorder(p);
		if(d < EPSLIMIT) break;
		p = p + dir * d;
	  }
        
      if (d<EPSLIMIT) fragColor.xyz += electricity(uv);
            
      fragColor.w = 1.0; //Alpha
      
    }
   
    //Gamma correction
     fragColor.xyz=pow(fragColor.xyz, vec3(1.4));
    
}
