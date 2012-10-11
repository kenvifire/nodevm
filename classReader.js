var fs = require("fs");
var Buffer = require('buffer').Buffer;
var classFile = {
	'maigc':0,
	'minorVersion':0,
	'majorVersion':0,
	'constantPoolCount':0,
	'tag':1
	


};

var readTag = function(fd){

	var result =  readU(fd,1);

	return result;
}
var readU1 = function(fd){
	return readU(fd,1);
}

var readU2 = function(fd){
	return readU(fd,2);

	
}

var readFloat = function(fd){
	throw new Error("not implemented");
}
var readUtf8Str = function(fd,length){
	var buffer = new Buffer(length);
	var bytesRead = fs.readSync(fd,buffer, 0, length, null);

	if(bytesRead != length){
		throw new Error("read error");
	}

	var count = 0;
	var char_count = 0;
	var char_buffer = new Buffer();
	//deal with ascii char
	while( count<length ){
		var c = buffer[count]&0xff;
		if(c>127) break;
		count++;
		char_buffer[char_count++]=c;
	}

	while(count < length){
		var c = buffer[count]&0xff;
		switch(c>>4){
			case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
				count ++;
				char_buffer[char_count++]=c;
				break;
			case 12: case 13:
				count +=2;
				if(count > length)
					throw new Error("invalid utf8 ");
				var c2 = buffer[count-1];
				if((c2 & 0xC0) != 0x80)
					throw new Error("invalid utf8 character");
				char_buffer[char_count++]=((x&0x1f) << 6)+(c2 & 0x3f);
				break;
			case 14:
				count +=3;
				if(count > length)
					throw new Error("invalid utf 8 ");
				var c2 = buffer[count-1];
				var c3 = buffer[count-2];
				if((c2&0xC0)!= 0x80 | (c3&0xC0)!= 0x80)
					throw new Error("invalid utf 8 ");
				char_buffer[char_count++]=((c&0xf)<<12)+((c2&0x3f)<<6)+(z&0x3f);
				break;
			default:
				throw new Error("invalid utf8");
				beak;

		}
	}
	return char_buffer.toString('utf8',0,char_count-1);

}

var readU4 = function(fd){
	return readU(fd,4);
}

var readU = function(fd,bytes){
	var buffer = new Buffer(bytes);
	var bytesRead = fs.readSync(fd, buffer, 0, bytes, null);

	if(bytesRead != bytes){
			console.log("read error");
	}else{
			var count = 0;
			var result="";
			while(count<bytes){
				result += buffer[count].toString(16);
				count++;
			}
			
			return new Number("0x"+result);
			
	}
}

var ClassInfo = function (){
	this.tag = 7,
	this.nameIndex = -1,
	this.read = function(fd){
		this.nameIndex = readU2(fd);
	}
}

var ConstantField = function (){
	this.tag = 9,
	this.classIndex = -1,
	this.nameAndTypeIndex = -1
	this.read = function(fd){
		this.classIndex = readU2(fd);
		this.nameAndType = readU2(fd);
	}
}

var ConstantMethodRef = function (){
	this.tag = 10,
	this.classIndex = -1,
	this.nameAndTypeIndex = -1
	this.read = function(fd){
		this.classIndex = readU2(fd);
		this.nameAndTypeIndex = readU2(fd);
	}

}


var ConstantInterfaceMethodRef = function (){
	this.tag = 11,
	this.classIndex = -1,
	this.nameAndTypeIndex =-1
	this.read = function(fd){
		this.classIndex = readU2(fd);
		this.nameAndTypeIndex = readU2(fd);
	}
}

var ConstantString = function (){
	this.tag = 8,
	this.stringIndex = -1
	this.read = function(fd){
		this.stringIndex = readU2(fd);
		
	}
}

var ConstantInteger = function (){
	this.tag = 3,
	this.value = undefined
	this.read = function(fd){
		this.value = readU4(fd);
		
	}
}

var ConstantFloat = function (){
	this.tag = 4,
	this.value = undefined
	this.read = function(fd){

	}
}

var ConstantLong = function (){
	this.tag = 5,
	this.highValue =undefined,
	this.lowValue = undefined
}

var ConstantDouble =  function(){
	this.tag = 6,
	this.highValue = undefined,
	this.lowValue = undefined
}

var ConstantNameAndType = function(){
	this.tag = 12,
	this.nameIndex = -1,
	this.descriptorIndex = -1
}

var ConstantUtf8 = function(){
	this.tag = 1,
	this.length = -1,
	this.value = undefined
	this.read = function(fd){
		this.length = readU2(fd);
		console.log("==>"+this.length);
		this.value= readUtf8Str(fd,this.length);

	}
}

var ConstantMethodHandler = function(){
	this.tag = 15,
	this.referenceKind = undefined,
	this.referenceIndex = undefined
}

function ConstantMethodType_Info(){
	this.tag = 16,
	this.descriptorIndex = -1
}

var  ConstantInvokeDynamic = function(){
	this.tag = 18,
	this.boostrapMethodAttrIndex = undefined,
	this.nameAndTypeIndex = -1
}



fs.open("Hello.class","r",function(status,fd){
	if(status){
		console.log(status.message);
		return;
	}
	
		
		 classFile.magic = readU4(fd);
		
		// //minorVersion and majorVersion

		 classFile.minorVersion = readU2(fd);


		 classFile.majorVersion = readU2(fd);

		//constantPoolCount
		 classFile.constantPoolCount = readU2(fd);


		 //read constatn pool
		var count = 0;
		var constantPool = new Array(classFile.constantPoolCount-1);

		while(count<classFile.constantPoolCount-1){
			var tag = readTag(fd);

			switch(tag.valueOf()){
				
				case 1:
					var utf8Str = new ConstantUtf8();
					var str = utf8Str.read(fd);
					console.log(str);
					constantPool.push(utf8Str);
					break;
				case 3:
					var integer = new ConstantInteger();
					integer.read(fd);
					constantPool.push(integer);
					break;
				case 4: 
					var float = new ConstantFloat();
					float.read(fd);
					constantPool.push(integer);
					break;
				case 5:
					var long = new ConstantLong();
					long.read(fd);
					constantPool.push(long);
					break;
				case 6:
					var double = new ConstantDouble();
					double.read(fd);
					constantPool.push(double);
					break;
				case 7:
					var clazz = new ClassInfo();
					clazz.read(fd);
					constantPool.push(clazz);
					break;
				case 8:
					var string = new ConstantString();
					string.read(fd);
					constantPool.push(string);
					break;
				case 9:
					var fieldRef = new ConstantField();
					fieldRef.read(fd);
					constantPool.push(fieldRef);
					break;
				case 10:
					var methodRef = new ConstantMethodRef();
					methodRef.read(fd);
					constantPool.push(methodRef);
					break;
				case 11:
					var interfaceMethodRef = new interfaceMethodRef();
					interfaceMethodRef.read(fd);
					constantPool.push(interfaceMethodRef);
					break;
				case 12:
					var nameAndType = new ConstantNameAndType();
					nameAndType.read(fd);
					constantPool.push(nameAndType);
					break;
				case 15:
					var methodHandler = new ConstantMethodHandler();
					methodHandler.read(fd);
					constantPool.push(methodHandler);
					break;
				case 16:
					var methodType = new ConstantMethodType_Info();
					methodType.read(fd);
					constantPool.push(methodType);
					break;
				case 18:
					var invokeDynamic = new ConstantInvokeDynamic();
					invokeDynamic.read(fd);
					constantPool.push(invokeDynamic);
					break;
			}

			count++;
		}


		


		// console.log(classFile.magic.toString(16)+","+classFile.majorVersion.toString(16)+","
		// 	+classFile.minorVersion.toString(16)+",constantPoolCount:"+classFile.constantPoolCount.toString());

		console.log("end");

	//});

	

});

